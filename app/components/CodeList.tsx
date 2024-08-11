import CodeCard from "./CodeCard";

type CodeListProps = {
    codes: string[];
};

const CodeList = ({ codes }: CodeListProps) => {
    return (
        <>
            {codes.map((code, index) => (
                <CodeCard code={code} key={index} />
            ))}
        </>
    );
};

export default CodeList;
