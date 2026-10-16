"use client";

import { useEffect } from "react";

export function DomPatch() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Parche seguro para removeChild
    const originalRemoveChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function <T extends Node>(child: T): T {
      if (child.parentNode !== this) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "Ignored removeChild on modified DOM node (translator/extension):",
            this,
            child
          );
        }
        return child;
      }
      return originalRemoveChild.call(this, child) as T;
    };

    // Parche seguro para insertBefore
    const originalInsertBefore = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function <T extends Node>(
      newNode: T,
      referenceNode: Node | null
    ): T {
      if (referenceNode && referenceNode.parentNode !== this) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "Ignored insertBefore on modified DOM node (translator/extension):",
            this,
            referenceNode
          );
        }
        return newNode;
      }
      return originalInsertBefore.call(this, newNode, referenceNode) as T;
    };
  }, []);

  return null;
}