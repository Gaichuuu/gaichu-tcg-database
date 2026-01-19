import { ReactNode } from "react";

interface CardDetailRowProps {
  label: string;
  children: ReactNode;
}

export default function CardDetailRow({ label, children }: CardDetailRowProps) {
  return (
    <tr>
      <th>{label}</th>
      <td>{children}</td>
    </tr>
  );
}
