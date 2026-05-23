import {
    format,
    subDays,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
  } from "date-fns";
  
  export const toDateKey = (d) => format(d, "yyyy-MM-dd");
  export const todayKey = () => toDateKey(new Date());
  
  export const lastNDays = () => {
    const end = new Date();
    const start = subDays(end, 6);
    return eachDayOfInterval({ start, end }).map(toDateKey);
  };
  
  export const last90Days = () => {
    const end = new Date();
    const start = subDays(end, 89);
    return eachDayOfInterval({ start, end }).map(toDateKey);
  };
  
//   export const weekKeys = () => weekKeysFor(new Date());
  
  export const currentWeekKeys = () => {
    const now =new Date();
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end }).map(toDateKey);
  };
  
  export const prettyDate = (d) => format(d instanceof Date ? d : new Date(d), "MMM d, yyyy");
  
  export const calcStreak = (keys) => {
    if (!keys?.length) return { current: 0, longest: 0 };
    const set = new Set(keys);
    const today = todayKey();
    const yKey = toDateKey(subDays(new Date(), 1));
    let current = 0;
    let cursor = new Date();
    if (!set.has(today) && !set.has(yKey)) {
      current = 0;
    } else {
      if (!set.has(today)) cursor = subDays(cursor, 1);
      while (set.has(toDateKey(cursor))) {
        current += 1;
        cursor = subDays(cursor, 1);
      }
    }
    const sortedAsc = [...keys].sort();
    let longest = 0;
    let run = 0;
    let prev = null;
    for (const k of sortedAsc) {
      if (prev) {
        const d=new Date(k);
        const p=new Date(prev);
        const diff = Math.round(
          (d - p) / (1000 * 60 * 60 * 24)
        );
        if(diff === 1)  run += 1 ;
        else run=1;
      } else run = 1;
      if (run > longest) longest = run;
      prev = k;
    }
    return { current, longest };
  };
  