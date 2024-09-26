export type WaterEntry = {
    date: string;
    intake: number;
    drinkLog: number[];
};
 
export const getWaterHistory = (): WaterEntry[] => 
    JSON.parse(localStorage.getItem("waterHistory") || "[]");
 
export const saveWaterHistory = (history: WaterEntry[]): void => 
    localStorage.setItem("waterHistory", JSON.stringify(history));
 