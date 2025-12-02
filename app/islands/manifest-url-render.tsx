interface ManifestUrlRenderProps {
  url: string;
}

export const ManifestUrlRender = (props: ManifestUrlRenderProps) => {
  return (
    <textarea
      className="field-sizing-content w-full rounded-md bg-neutral-100 px-2 py-1 text-center"
      name="manifest-url"
      readonly
      onClick={() => {
        navigator?.clipboard?.writeText(props.url).then(() => {
          alert("Copied to clipboard");
        });
      }}
      onKeyPress={() => {}}
    >
      {props.url}
    </textarea>
  );
};
