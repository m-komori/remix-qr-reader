import { useEffect, useRef, useState } from "react";
import QRCodeScanner from "./QRCodeScanner";
import { VIDEO_SIZE } from "../constants";
import CodeList from "./CodeList";
import LargeButton from "./LargeButton";
import AlertModal from "./AlertModal";
// import "./style.css";

const QRMain = () => {
    const [savingMode, setSavingMode] = useState<boolean>(false);
    const [isScanning, setScanning] = useState<boolean>(false);
    const divRef = useRef<HTMLDivElement>(null);
    const [codeHistory, setCodeHistory] = useState<string[]>([]);
    const timerId = useRef<NodeJS.Timeout | null>(null);
    const codeHistoryRef = useRef<string[]>(codeHistory);
    const [cameraResume, setCameraResume] = useState<boolean>(false);
    const [previewWidth, setPreviewWidth] = useState<number>(VIDEO_SIZE.height);
    const [previewHeight, setPreviewHeight] = useState<number>(
        VIDEO_SIZE.width
    );
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        // 画面のアスペクト比を保持したプレビューのサイズを計算
        let previewWidth = Math.round(window.innerWidth * 0.6);
        let previewHeight = Math.round(
            (VIDEO_SIZE.width / VIDEO_SIZE.height) * previewWidth
        );
        // 画面が狭い端末用微調整
        if (previewHeight > window.innerHeight / 2 - 50) {
            previewHeight = Math.round(window.innerHeight / 2 - 50);
            previewWidth = Math.round(
                (VIDEO_SIZE.height / VIDEO_SIZE.width) * previewHeight
            );
        }
        setPreviewWidth(previewWidth);
        setPreviewHeight(previewHeight);
    }, []);

    useEffect(() => {
        codeHistoryRef.current = codeHistory;
    }, [codeHistory]);

    // バーコード検出時のコールバック関数
    const detectionCode = (data: string) => {
        setScanning(false);
        if (codeHistoryRef.current.includes(data)) {
            setDialogOpen(true);
        } else {
            setCodeHistory((prev) => [data, ...prev]);
            divRef.current?.scrollTo(0, 0);
        }
        startTimer();
    };

    const startTimer = () => {
        timerId.current = setTimeout(() => {
            setCameraResume(true);
            timerId.current = null;
        }, 1000);
    };

    const stopTimer = () => {
        if (timerId.current) {
            clearTimeout(timerId.current);
            timerId.current = null;
            // カメラ再開
            setCameraResume(true);
        }
    };

    const clickHandler = () => {
        setCodeHistory([]);
    };

    const scanHandler = () => {
        if (!isScanning && timerId.current) {
            stopTimer();
        }
        setScanning(!isScanning);
    };

    const changeSavingMode = () => {
        if (!savingMode && isScanning) {
            setScanning(false);
        }
        setSavingMode(!savingMode);
    };

    return (
        <>
            <div className="flex flex-col items-center p-2 pt-4 h-svh">
                <div>
                    {savingMode ? (
                        <div
                            className="bg-neutral-300"
                            style={{
                                width: previewWidth,
                                height: previewHeight,
                            }}
                        ></div>
                    ) : (
                        <QRCodeScanner
                            width={previewWidth}
                            height={previewHeight}
                            disabled={!isScanning}
                            callback={detectionCode}
                            resume={cameraResume}
                            resumeCallback={() => setCameraResume(false)}
                        />
                    )}
                </div>
                <div className="flex flex-row mt-5 justify-end w-full mr-5">
                    <label className="text-neutral-500">
                        カメラオフ
                        <input
                            className="mr-2 mt-[0.3rem] h-3.5 w-8 appearance-none rounded-[0.4375rem] bg-neutral-300 before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:-mt-[0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-none after:bg-neutral-100 after:shadow-[0_0px_3px_0_rgb(0_0_0_/_7%),_0_2px_2px_0_rgb(0_0_0_/_4%)] after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-primary checked:after:absolute checked:after:z-[2] checked:after:-mt-[3px] checked:after:ml-[1.0625rem] checked:after:h-5 checked:after:w-5 checked:after:rounded-full checked:after:border-none checked:after:bg-primary checked:after:shadow-[0_3px_1px_-2px_rgba(0,0,0,0.2),_0_2px_2px_0_rgba(0,0,0,0.14),_0_1px_5px_0_rgba(0,0,0,0.12)] checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] hover:cursor-pointer focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[3px_-1px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-5 focus:after:w-5 focus:after:rounded-full focus:after:content-[''] checked:focus:border-primary checked:focus:bg-primary checked:focus:before:ml-[1.0625rem] checked:focus:before:scale-100 checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:bg-neutral-600 dark:after:bg-neutral-400 dark:checked:bg-primary dark:checked:after:bg-primary dark:focus:before:shadow-[3px_-1px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca]"
                            type="checkbox"
                            role="switch"
                            checked={savingMode}
                            onChange={changeSavingMode}
                        />
                    </label>
                </div>
                <LargeButton
                    label={isScanning ? "スキャン中…" : "スキャン"}
                    onClick={scanHandler}
                    disabled={savingMode}
                />
                <div className="mt-4 w-4/5 flex flex-row justify-center">
                    <div className="">履歴</div>
                    <button
                        className="fixed right-4 -mt-2 p-0 pl-2 pr-2 border-2 border-neutral-400 bg-red-50 text-black"
                        onClick={clickHandler}
                    >
                        削除
                    </button>
                </div>
                <div
                    className="w-4/5 flex-1 border-2 border-slate-200 overflow-auto"
                    ref={divRef}
                >
                    <CodeList codes={codeHistory} />
                </div>
            </div>
            <AlertModal
                onClose={(open) => setDialogOpen(open)}
                isOpen={dialogOpen}
                title="エラー"
            >
                すでに登録されています
            </AlertModal>
        </>
    );
};

export default QRMain;
