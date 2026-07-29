import { useState } from "react";
import RegisterSupplier from "../components/RegisterSupplier";

export default function DevSupplierPreview() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div>
      <RegisterSupplier
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={() => {}}
      />
    </div>
  );
}
