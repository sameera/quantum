export function Loader({ text }: { text?: string }) {
    return <div>{text || "Loading..."}</div>;
}
