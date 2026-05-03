import Rocket from "@/assets/icons/rocket.svg?react";
import Button from "@/components/common/button";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
    const navigate = useNavigate();
    return (
        <div className="w-full flex flex-col items-center justify-center m-auto gap-12">
            <Rocket className="w-20 h-20"/>
            <div className="flex flex-col items-center gap-1">
                <p className="text-primary-60 text-heading-1">404</p>
                <p className="text-coolgray-90 text-heading-4">페이지를 찾을 수 없습니다.</p>
            </div>
            <Button variant="outlined"
                    className="w-40"
                    onClick={() => navigate("/")}>
                        홈으로
            </Button>
        </div>
    );
}