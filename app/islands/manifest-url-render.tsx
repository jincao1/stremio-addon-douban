import { useRef } from "hono/jsx";

interface ManifestUrlRenderProps {
  url: string;
}

export const ManifestUrlRender = (props: ManifestUrlRenderProps) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  return (
    <textarea
      ref={ref}
      className="field-sizing-content w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-center font-mono text-sm text-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
      name="manifest-url"
      readonly
      onClick={() => {
        ref.current?.select();
      }}
    >
      {props.url}
    </textarea>
  );
};
