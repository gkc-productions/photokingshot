type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  body?: string;
};

export function SectionHeading({ eyebrow, title, body }: SectionHeadingProps) {
  return (
    <div className="max-w-3xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">{title}</h2>
      {body ? <p className="mt-4 text-base leading-7 text-white/68 md:text-lg">{body}</p> : null}
    </div>
  );
}
