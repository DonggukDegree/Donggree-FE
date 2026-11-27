/**
 * [동아리] 사진 크롭 모달
 * 동아리 사진은 목록 카드·상세 화면과 같은 가로 4:3으로 잘라 올린다.
 * 사진을 끌어 위치를, 아래 막대(PC는 휠·모바일은 두 손가락도 가능)로 확대를 맞추고, 자른 결과만 올린다.
 * 등록 폼 전용 화면이라 modalStore 대신 폼이 직접 띄운다(상세 모달과 같은 방식).
 */
import { useEffect, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { toast } from 'sonner';

import Button from '@/components/common/inputs/button';
import { CLUB_LIMITS } from '@/constants/club';
import type { TClubImageCropTarget } from '@/types/club/TClubForm';
import { cropImageToFile } from '@/utils/club/clubImageCrop';

interface IClubImageCropModalProps {
  target: TClubImageCropTarget;
  // 지금 사진을 포함해 크롭을 기다리는 사진 수
  remaining: number;
  onConfirm: (file: File) => void;
  onCancel: () => void;
}

const ZOOM_MIN = 1;
const ZOOM_MAX = 3;

export default function ClubImageCropModal({ target, remaining, onConfirm, onCancel }: IClubImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(ZOOM_MIN);
  const [area, setArea] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isCropping) onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCropping, onCancel]);

  const confirm = async () => {
    if (!area) return;
    setIsCropping(true);
    try {
      onConfirm(await cropImageToFile(target.url, area, target.file.name));
    } catch {
      toast.error('사진을 자르지 못했어요. 다른 사진을 골라주세요.');
      onCancel();
    } finally {
      setIsCropping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-overlay lg:items-center lg:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="club-image-crop-title"
        className="flex max-h-[92dvh] w-full max-w-[640px] flex-col gap-4 overflow-y-auto rounded-t-2xl bg-white p-5 lg:rounded-2xl lg:p-6"
      >
        <div className="flex flex-col gap-1">
          <h2 id="club-image-crop-title" className="text-heading-6 text-coolgray-90 lg:text-heading-5">
            사진 자르기{remaining > 1 ? ` (남은 사진 ${remaining}장)` : ''}
          </h2>
          <p className="text-body-s text-coolgray-60">
            목록 카드와 같은 가로 4:3으로 올라가요. 사진을 끌어 위치를, 아래 막대로 크기를 맞춰주세요.
          </p>
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-coolgray-90">
          <Cropper
            image={target.url}
            crop={crop}
            zoom={zoom}
            minZoom={ZOOM_MIN}
            maxZoom={ZOOM_MAX}
            aspect={CLUB_LIMITS.IMAGE_ASPECT}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, pixels) => setArea(pixels)}
          />
        </div>

        <label className="flex items-center gap-3 text-body-s text-coolgray-60">
          <span className="shrink-0">크기</span>
          <input
            type="range"
            min={ZOOM_MIN}
            max={ZOOM_MAX}
            step={0.01}
            value={zoom}
            aria-label="사진 확대"
            onChange={(event) => setZoom(Number(event.target.value))}
            className="w-full cursor-pointer accent-primary-60"
          />
        </label>

        <div className="flex gap-2">
          <Button type="button" variant="outlined" className="flex-1" disabled={isCropping} onClick={onCancel}>
            취소
          </Button>
          <Button
            type="button"
            variant={area && !isCropping ? 'primary' : 'disabled'}
            className="flex-1"
            onClick={() => void confirm()}
          >
            {isCropping ? '자르는 중' : '이대로 올리기'}
          </Button>
        </div>
      </div>
    </div>
  );
}
