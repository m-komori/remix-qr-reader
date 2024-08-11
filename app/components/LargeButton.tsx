type LargeButtonProps = {
    onClick: () => void;
    label: string;
    disabled?: boolean;
};

const LargeButton = ({
    onClick,
    label,
    disabled = false,
}: LargeButtonProps) => {
    return (
        <button
            className="w-80 h-12 border-2 border-neutral-400 bg-red-50 text-black active:opacity-60"
            onClick={onClick}
            disabled={disabled}
        >
            {label}
        </button>
    );
};

export default LargeButton;
