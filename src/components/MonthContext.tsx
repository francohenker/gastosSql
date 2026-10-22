import React, { createContext, useContext, useState } from 'react';
import { currentMonth } from '../utils/format';

const Ctx = createContext<{ month: string; setMonth: (m: string) => void }>({
  month: currentMonth(),
  setMonth: () => {},
});

export const MonthProvider = ({ children }: { children: React.ReactNode }) => {
  const [month, setMonth] = useState(currentMonth());
  return <Ctx.Provider value={{ month, setMonth }}>{children}</Ctx.Provider>;
};

export const useMonth = () => useContext(Ctx);
