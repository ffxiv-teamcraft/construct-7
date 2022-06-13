export interface BaseStructElement {
  type: "start" | "body" | "end" | "block";
  label?: string;
}

export interface EndStructElement extends BaseStructElement {
  type: "end";
  label: string;
}

export interface BlockStructElement extends BaseStructElement {
  type: "block";
  label: string;
}

export type StructElement = BaseStructElement | EndStructElement;
