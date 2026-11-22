/** [정각원의 비밀] 한국 사찰에서 보물상자로 향하는 흰 코끼리. 진행·성공·실패 상태에 따라 걷기·울기·연등을 들고 웃기로 전환한다. */
import cryingAkoImage from '@/assets/mystery/cryingAko.webp';
import gloatingAkoImage from '@/assets/mystery/gloatingAko.webp';
import templeImage from '@/assets/mystery/koreanTemple.webp';
import chestImage from '@/assets/mystery/treasureChest.webp';
import akoImage from '@/assets/mystery/whiteAko.webp';
import type { TMysteryToday } from '@/types/mystery/TMystery';

export default function MysteryGauge({ attempts, status }: { attempts: number; status: TMysteryToday['status'] }) {
  const won = status === 'WON';
  const lost = status === 'LOST';
  const actorClass = won ? 'is-caught' : lost ? 'is-gloating' : '';
  const actorImage = won ? cryingAkoImage : lost ? gloatingAkoImage : akoImage;
  const step = Math.min(10, Math.max(0, attempts));
  return (
    <section
      className="mystery-gauge"
      aria-label={
        won
          ? `${attempts}번의 의심으로 연등을 지켰어요. 어둠의 아코가 ${step}번째 칸에서 울고 있어요.`
          : lost
            ? '어둠의 아코가 마지막 칸에서 연등을 들고 음흉하게 기뻐하고 있어요.'
            : `어둠의 아코 도주 ${step}/10칸, 남은 추리 ${10 - attempts}회`
      }
    >
      <div className="mystery-track">
        <img src={templeImage} className="mystery-temple" alt="" width="384" height="256" />
        <div className="mystery-track-line">
          <div className="mystery-track-progress" style={{ width: `${step * 10}%` }} />
          {Array.from({ length: 11 }, (_, i) => (
            <span key={i} className={i <= step ? 'is-passed' : ''} />
          ))}
          <div className={`mystery-ako ${actorClass}`} style={{ left: `${step * 10}%` }} aria-hidden="true">
            <img
              key={step}
              src={actorImage}
              className={`mystery-ako-sprite ${actorClass}`}
              alt=""
              width="350"
              height="320"
            />
            {!won && !lost && step > 0 && (
              <span key={`dust-${step}`} className="mystery-ako-dust">
                ✧ · ✦
              </span>
            )}
          </div>
        </div>
        <img src={chestImage} className="mystery-chest" alt="" width="350" height="320" />
      </div>
    </section>
  );
}
