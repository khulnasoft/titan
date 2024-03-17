import { Children, ReactNode } from 'react';

export function SideBySide({ children }: { children: ReactNode }) {
  const [first, ...rest] = Children.toArray(children);
  return (
    <div className="not-prose grid items-center divide-x divide-solid divide-slate-50 dark:divide-slate-800 md:grid-cols-2">
      <div className="md:pr-6">{first}</div>
      <div className="md:pl-6">{rest}</div>
    </div>
  );
}
