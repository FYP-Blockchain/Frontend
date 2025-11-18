export const weiToEther = (wei: string | number | { toString(): string } | undefined | null) => {
  if (wei == null) return "0.000";

  const formatNumber = (n: number) => {
    if (!Number.isFinite(n)) return "0.000";
    if (n > 0 && n < 0.001) {
      return parseFloat(n.toPrecision(2)).toString();
    }
    return n.toFixed(3);
  };

  if (typeof wei === "string" && wei.indexOf(".") !== -1) {
    return formatNumber(Number(wei));
  }

  try {
    const weiStr = typeof wei === "object" ? wei.toString() : String(wei);
    const cleaned = weiStr.replace(/[, \s]/g, "");
    const weiBig = BigInt(cleaned);
    const oneEth = 10n ** 18n;
    const ethValue = Number(weiBig * 1000000n / oneEth) / 1000000;
    return formatNumber(ethValue);
  } catch (e) {
    const num = Number(wei as any);
    if (!Number.isFinite(num)) return "0.000";
    if (Math.abs(num) >= 1e12) {
      return formatNumber(num / 1e18);
    }
    return formatNumber(num);
  }
};
