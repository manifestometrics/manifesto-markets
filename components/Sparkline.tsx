"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  type AreaData,
  type Time,
} from "lightweight-charts";

interface SparklineProps {
  data: Array<{ time: string; value: number }>;
  /** positive (green) or negative (red) tone */
  tone?: "up" | "down" | "neutral";
  height?: number;
}

/**
 * A terminal-style sparkline. Pulls in lightweight-charts on the client only.
 * Data is expected to be sorted ascending by `time` (YYYY-MM-DD or ISO).
 */
export function Sparkline({ data, tone = "neutral", height = 44 }: SparklineProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);

  useEffect(() => {
    if (!ref.current || data.length === 0) return;

    const chart = createChart(ref.current, {
      width: ref.current.clientWidth,
      height,
      layout: {
        background: { color: "transparent" },
        textColor: "#8B8B85",
        fontSize: 10,
        attributionLogo: false,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      rightPriceScale: { visible: false },
      timeScale: { visible: false, borderVisible: false },
      crosshair: {
        vertLine: { visible: false },
        horzLine: { visible: false },
      },
      handleScale: false,
      handleScroll: false,
    });

    const color =
      tone === "up"
        ? "#0F7A37"
        : tone === "down"
        ? "#B91C1C"
        : "#1B2A4E";

    // lightweight-charts v4: use addAreaSeries() instead of addSeries(AreaSeries, ...)
    const series = chart.addAreaSeries({
      lineColor: color,
      topColor: color + "33",
      bottomColor: color + "00",
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const points: AreaData[] = data.map((d) => ({
      time: d.time as Time,
      value: d.value,
    }));

    series.setData(points);
    chart.timeScale().fitContent();

    chartRef.current = chart;
    seriesRef.current = series;

    const onResize = () => {
      if (chartRef.current && ref.current) {
        chartRef.current.applyOptions({ width: ref.current.clientWidth });
      }
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [data, tone, height]);

  return <div ref={ref} style={{ width: "100%", height }} />;
}