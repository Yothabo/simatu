type ImageSelectorItem = {
  src: string;
  label: string;
};

type ImageSelectorProps = {
  items: ImageSelectorItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
  className?: string;
};

export default function ImageSelector({
  items,
  activeIndex,
  onSelect,
  className = "",
}: ImageSelectorProps) {
  return (
    <div className={`hp-image-selector ${className}`.trim()}>
      {items.map((item, index) => (
        <button
          key={`${item.src}-${index}`}
          type="button"
          className={`hp-image-selector__item ${
            activeIndex === index ? "is-active" : ""
          }`}
          aria-label={`Show ${item.label}`}
          aria-pressed={activeIndex === index}
          onClick={() => onSelect(index)}
        >
          <img src={item.src} alt="" loading="lazy" />
        </button>
      ))}
    </div>
  );
}
