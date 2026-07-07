import type { GearLendingQuery } from "@/graphql";
import { GearPhotoThumb } from "@/components/gear/gear-photo-thumb";

type GearLoanItem = GearLendingQuery["gearLending"]["activeLoans"][number]["items"][number];

type GearLoanItemListProps = {
  items: GearLoanItem[];
};

export function GearLoanItemList({ items }: GearLoanItemListProps) {
  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const kind = item.gearItem ? "item" : "variant";
        const id = item.gearItem?.id ?? item.gearVariant?.id;
        if (!id) {
          return null;
        }
        return (
          <li key={item.id} className="flex items-center gap-2">
            <GearPhotoThumb
              kind={kind}
              id={id}
              hasPhoto={item.hasPhoto}
              alt={item.displayName}
              className="h-8 w-8"
            />
            <span className="text-text-main">{item.displayName}</span>
          </li>
        );
      })}
    </ul>
  );
}
