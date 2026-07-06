import {
  GEAR_LIBRARY_QUERY,
  GEAR_LENDING_QUERY,
} from "@/graphql";

export const GEAR_PAGE_REFETCH = [GEAR_LIBRARY_QUERY, GEAR_LENDING_QUERY] as const;
