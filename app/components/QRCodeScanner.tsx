import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import type { Point } from "jsqr/dist/locator";
import { VIDEO_SIZE } from "../constants";

const LINE_COLOR = "#FF3B58";

const CAMERA_SETTINGS: MediaStreamConstraints = {
    audio: false,
    video: {
        ...VIDEO_SIZE,
        facingMode: "environment",
    },
};

type QRCodeScannerProps = {
    width: number;
    height: number;
    disabled: boolean;
    callback: (data: string) => void;
    resume: boolean;
    resumeCallback: () => void;
};

const QRCodeScanner = ({
    width,
    height,
    disabled,
    callback,
    resume,
    resumeCallback,
}: QRCodeScannerProps) => {
    const [isLoading, setLoading] = useState<boolean>(true);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDestroyed = useRef<boolean>(false);
    const isSuspended = useRef<boolean>(false);

    // tick関数内で取得できるようにuseRefで入れ替え
    const disabledRed = useRef<boolean>(disabled);
    useEffect(() => {
        disabledRed.current = disabled;
    }, [disabled]);

    useEffect(() => {
        console.log("resume", resume, isSuspended.current);
        if (resume && isSuspended.current) {
            // 画面再開
            isSuspended.current = false;
            resumeCallback();
        }
    }, [resume, resumeCallback]);

    useEffect(() => {
        let stream: MediaStream | null = null;
        // カメラ起動
        const openCamera = async () => {
            const video = videoRef.current;
            if (video) {
                stream = await navigator.mediaDevices.getUserMedia(
                    CAMERA_SETTINGS
                );

                video.srcObject = stream;
                video.play();
                requestAnimationFrame(tick);
            }
        };
        openCamera();

        return () => {
            if (stream) {
                isDestroyed.current = true;
                stream.getVideoTracks()[0].stop();
                stream.getTracks().forEach((track) => track.stop());
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const drawLine = (begin: Point, end: Point, color: string = LINE_COLOR) => {
        const context = canvasRef?.current?.getContext("2d");
        if (!context) {
            return;
        }

        context.beginPath();
        context.moveTo(begin.x, begin.y);
        context.lineTo(end.x, end.y);
        context.lineWidth = 4;
        context.strokeStyle = color;
        context.stroke();
    };

    const tick = () => {
        if (isDestroyed.current) {
            return;
        }
        const canvas = canvasRef?.current;
        const video = videoRef?.current;
        if (!canvas || !video) {
            return;
        }
        const context = canvas.getContext("2d")!;

        if (
            video.readyState === video.HAVE_ENOUGH_DATA &&
            !isSuspended.current
        ) {
            canvas.hidden = false;
            setLoading(false);

            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
            );
            // 有効な時だけQR判定
            if (!disabledRed.current) {
                // QRコード判定
                const code = jsQR(
                    imageData.data,
                    imageData.width,
                    imageData.height,
                    {
                        inversionAttempts: "dontInvert",
                    }
                );
                if (code && code.data) {
                    // QRコードを検出したら枠線描画
                    drawLine(
                        code.location.topLeftCorner,
                        code.location.topRightCorner
                    );
                    drawLine(
                        code.location.topRightCorner,
                        code.location.bottomRightCorner
                    );
                    drawLine(
                        code.location.bottomRightCorner,
                        code.location.bottomLeftCorner
                    );
                    drawLine(
                        code.location.bottomLeftCorner,
                        code.location.topLeftCorner
                    );
                    // callback
                    callback(code.data);
                    // QRコードを検出したら画面停止
                    isSuspended.current = true;
                }
            }
        }
        requestAnimationFrame(tick);
    };

    return (
        <div className="max-w-full">
            <video
                autoPlay
                playsInline={true}
                ref={videoRef}
                hidden={true}
                className="hidden"
            />
            <canvas ref={canvasRef} hidden={true} style={{ width, height }} />
            {isLoading && <div style={{ width, height }}></div>}
        </div>
    );
};

export default QRCodeScanner;
