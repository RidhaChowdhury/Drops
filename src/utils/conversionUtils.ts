export const convertFromOunces = (oz: number, unit: "oz" | "mL" | "L" | "cups"): number => {
    const conversionRates = {
       oz: 1,
       mL: 29.5735,
       L: 0.0295735,
       cups: 0.125,
       gallons: 0.0078125,
       pints: 0.0625,
    };
    return oz * conversionRates[unit];
 };
 
 export const convertToOunces = (amount: number, unit: "oz" | "mL" | "L" | "cups"): number => {
    const conversionRates = {
       oz: 1,
       mL: 1 / 29.5735,
       L: 1 / 0.0295735,
       cups: 1 / 0.125,
       gallons: 1 / 0.0078125,
       pints: 1 / 0.0625,
    };
    return amount * conversionRates[unit];
 };
 