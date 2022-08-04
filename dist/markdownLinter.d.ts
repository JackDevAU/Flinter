interface FlinterProps {
    markdown: string;
}
declare type FlinterResult = 'success' | 'failure';
interface Flinter {
    result: FlinterResult;
    error: string;
}
declare const lintFrontmatter: ({ markdown }: FlinterProps) => Flinter[];
export default lintFrontmatter;
