import { useEffect, useRef, memo, useState, useCallback } from "react";
import { createChart, ColorType, CandlestickSeries, LineSeries } from "lightweight-charts";
import { getHistoricalCandles } from "../../lib/api.js";
import MetricsGrid from "./MetricsGrid.jsx";

const INTERVALS = {
  "1m": 60,
  "5m": 5 * 60,
  "15m": 15 * 60,
  "1h": 60 * 60,
};

function ChartPanel({ stock }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);

  const liveCandleRef = useRef(null);
  const historyCandlesRef = useRef([]);

  const [interval, setInterval_] = useState("1m");
  const [chartType, setChartType] = useState("candle");
  const [loading, setLoading] = useState(false);
  const [hoveredCandle, setHoveredCandle] = useState(null);

  const chartTypeRef = useRef(chartType);
  useEffect(() => {
    chartTypeRef.current = chartType;
  }, [chartType]);

  const intervalSecRef = useRef(INTERVALS[interval]);
  useEffect(() => {
    intervalSecRef.current = INTERVALS[interval];
  }, [interval]);

  const getCandleBucket = useCallback((epochMs, intervalSec) => {
    const utcSec = Math.floor(epochMs / 1000);
    const istOffset = 19800;
    const shifted = utcSec + istOffset;
    const bucketShifted = shifted - (shifted % intervalSec);
    return bucketShifted - istOffset;
  }, []);

  const setSeriesData = useCallback((candles) => {
    if (!candleSeriesRef.current || candles.length === 0) return;

    const unique = [];

    for (const candle of candles) {
      const last = unique[unique.length - 1];

      if (!last) {
        unique.push(candle);
        continue;
      }

      if (candle.time > last.time) {
        unique.push(candle);
      } else if (candle.time === last.time) {
        unique[unique.length - 1] = candle;
      }
    }

    if (chartTypeRef.current === "candle") {
      candleSeriesRef.current.setData(unique);
    } else {
      candleSeriesRef.current.setData(
        unique.map((c) => ({
          time: c.time,
          value: c.close,
        }))
      );
    }

    if (volumeSeriesRef.current) {
      volumeSeriesRef.current.setData(
        unique
          .filter((c) => c.volume != null)
          .map((c) => ({
            time: c.time,
            value: c.volume,
          }))
      );
    }

    chartRef.current?.timeScale().fitContent();
  }, []);

  const updateSeriesCandle = useCallback((candle) => {
    if (!candleSeriesRef.current) return;

    if (chartTypeRef.current === "candle") {
      candleSeriesRef.current.update(candle);
    } else {
      candleSeriesRef.current.update({ time: candle.time, value: candle.close });
    }
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      localization: {
        timeFormatter: (time) => {
          return new Intl.DateTimeFormat("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }).format(new Date(time * 1000));
        }
      },
      layout: {
        background: { type: ColorType.Solid, color: "#ffffff" },
        textColor: "#45474c",
        fontFamily: "'Inter', sans-serif",
        fontSize: 12,
      },
      grid: {
        vertLines: { color: "#f0edef" },
        horzLines: { color: "#f0edef" },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight || 360,
      crosshair: {
        mode: 0,
        vertLine: {
          width: 1,
          color: "rgba(69, 71, 76, 0.3)",
          style: 2,
          labelBackgroundColor: "#45474c",
        },
        horzLine: {
          width: 1,
          color: "rgba(69, 71, 76, 0.3)",
          style: 2,
          labelBackgroundColor: "#45474c",
        },
      },
      rightPriceScale: {
        borderColor: "#e4e2e3",
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
      timeScale: {
        borderColor: "#e4e2e3",
        timeVisible: true,
        secondsVisible: false,
        barSpacing: 12,
        tickMarkFormatter: (time) => {
          return new Intl.DateTimeFormat("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }).format(new Date(time * 1000));
        }
      },
      handleScroll: { vertTouchDrag: false },
    });

    chartRef.current = chart;

    if (chartType === "candle") {
      candleSeriesRef.current = chart.addSeries(CandlestickSeries, {
        upColor: "#067647",
        downColor: "#b42318",
        borderUpColor: "#067647",
        borderDownColor: "#b42318",
        wickUpColor: "#067647",
        wickDownColor: "#b42318",
      });
    } else {
      candleSeriesRef.current = chart.addSeries(LineSeries, {
        color: "#0a6de1",
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        crosshairMarkerBorderColor: "#0a6de1",
        crosshairMarkerBackgroundColor: "#ffffff",
      });
    }

    volumeSeriesRef.current = chart.addSeries(LineSeries, {
      color: "rgba(69, 71, 76, 0.15)",
      lineWidth: 1,
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
      lastValueVisible: false,
      priceLineVisible: false,
    });

    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
      drawTicks: false,
      borderVisible: false,
    });

    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.point || param.point.x < 0 || param.point.y < 0) {
        setHoveredCandle(null);
      } else {
        const time = param.time;
        if (liveCandleRef.current && liveCandleRef.current.time === time) {
          setHoveredCandle({ ...liveCandleRef.current });
        } else {
          const candle = historyCandlesRef.current.find((c) => c.time === time);
          if (candle) setHoveredCandle({ ...candle });
        }
      }
    });

    const allCandles = [...historyCandlesRef.current];

    if (liveCandleRef.current) {
      const last = allCandles[allCandles.length - 1];

      if (!last || last.time !== liveCandleRef.current.time) {
        allCandles.push(liveCandleRef.current);
      } else {
        allCandles[allCandles.length - 1] = liveCandleRef.current;
      }
    }

    if (allCandles.length > 0) {
      setSeriesData(allCandles);
    }

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        chart.applyOptions({ width, height });
      }
    });
    ro.observe(chartContainerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, [chartType, setSeriesData]);

  useEffect(() => {
    if (!stock?.instrumentKey) return;

    let cancelled = false;

    async function loadHistory() {
      setLoading(true);
      liveCandleRef.current = null;
      historyCandlesRef.current = [];

      if (candleSeriesRef.current) candleSeriesRef.current.setData([]);
      if (volumeSeriesRef.current) volumeSeriesRef.current.setData([]);

      try {
        const data = await getHistoricalCandles(stock.instrumentKey, interval);
        if (cancelled) return;

        const candles = data.candles || [];
        for (let i = 1; i < candles.length; i++) {
          if (candles[i].time <= candles[i - 1].time) {
            console.error(
              "History contains duplicate/out-of-order candle:",
              candles[i - 1],
              candles[i]
            );
          }
        }
        candles.sort((a, b) => a.time - b.time);

        if (candles.length > 0) {
          historyCandlesRef.current = candles.slice(0, -1);

          liveCandleRef.current = { ...candles[candles.length - 1] };
          if (candleSeriesRef.current) {
            setSeriesData([
              ...historyCandlesRef.current,
              liveCandleRef.current,
            ]);
          }
        }
        else {
          historyCandlesRef.current = [];
          liveCandleRef.current = null;
        }
      } catch (err) {
        console.error("Failed to load historical candles:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [stock?.instrumentKey, interval, chartType]);

  useEffect(() => {
    if (!stock) return;
    const price = stock.price;
    if (price == null) return;
    if (!candleSeriesRef.current) return;
    if (historyCandlesRef.current.length === 0 && !liveCandleRef.current) {
      return;
    }

    const now = Date.now();
    const intervalSec = intervalSecRef.current;
    const bucket = getCandleBucket(now, intervalSec);

    const liveCandle = liveCandleRef.current;

    if (liveCandle && liveCandle.time === bucket) {
      liveCandle.high = Math.max(liveCandle.high, price);
      liveCandle.low = Math.min(liveCandle.low, price);
      liveCandle.close = price;

      updateSeriesCandle(liveCandle);
    } else {
      if (liveCandle) {
        const lastHistory =
          historyCandlesRef.current[historyCandlesRef.current.length - 1];

        if (!lastHistory || lastHistory.time !== liveCandle.time) {
          historyCandlesRef.current.push({ ...liveCandle });
        } else {
          historyCandlesRef.current[historyCandlesRef.current.length - 1] = {
            ...liveCandle,
          };
        }
      }

      const history = historyCandlesRef.current;
      const prevClose =
        liveCandle?.close ??
        (history.length > 0 ? history[history.length - 1].close : price);

      const newCandle = {
        time: bucket,
        open: prevClose,
        high: Math.max(prevClose, price),
        low: Math.min(prevClose, price),
        close: price,
      };

      liveCandleRef.current = newCandle;
      updateSeriesCandle(newCandle);

      if (!liveCandle && chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    }
  }, [stock?.price, stock?.ticker, loading, getCandleBucket, updateSeriesCandle]);

  const intervals = Object.keys(INTERVALS);
  const currentLatest = liveCandleRef.current || (historyCandlesRef.current.length > 0 ? historyCandlesRef.current[historyCandlesRef.current.length - 1] : null);

  if (!stock) {
    return (
      <div className="flex flex-col w-full gap-md h-full">
        <div
          id="chart-panel"
          className="bg-surface-container-lowest border border-outline-variant rounded-[12px] flex-grow flex items-center justify-center p-md min-h-[300px]"
        >
          <span className="text-on-surface-variant text-label-md">
            Select a stock to view chart
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
    <div
      id="chart-panel"
      className="bg-surface-container-lowest border border-outline-variant rounded-[12px] flex-grow flex flex-col overflow-hidden min-h-[300px]"
    >
      {/* ── Toolbar ── */}
      <div className="flex items-center gap-xs px-md py-sm border-b border-outline-variant bg-surface-bright">
        {/* Interval buttons */}
        <div className="flex items-center gap-[2px] bg-surface-container rounded-lg p-[2px]">
          {intervals.map((iv) => (
            <button
              key={iv}
              onClick={() => setInterval_(iv)}
              className={`px-sm py-[4px] rounded-md text-label-sm font-medium transition-all ${interval === iv
                  ? "bg-surface-container-lowest text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-primary"
                }`}
            >
              {iv}
            </button>
          ))}
        </div>

        <div className="w-[1px] h-[20px] bg-outline-variant mx-xs" />

        {/* Chart type toggle */}
        <div className="flex items-center gap-[2px] bg-surface-container rounded-lg p-[2px]">
          <button
            onClick={() => setChartType("candle")}
            className={`px-sm py-[4px] rounded-md text-label-sm font-medium transition-all flex items-center gap-[4px] ${chartType === "candle"
                ? "bg-surface-container-lowest text-primary shadow-sm"
                : "text-on-surface-variant hover:text-primary"
              }`}
            title="Candlestick"
          >
            <span className="material-symbols-outlined text-[16px]">candlestick_chart</span>
            <span className="hidden sm:inline">Candles</span>
          </button>
          <button
            onClick={() => setChartType("line")}
            className={`px-sm py-[4px] rounded-md text-label-sm font-medium transition-all flex items-center gap-[4px] ${chartType === "line"
                ? "bg-surface-container-lowest text-primary shadow-sm"
                : "text-on-surface-variant hover:text-primary"
              }`}
            title="Line chart"
          >
            <span className="material-symbols-outlined text-[16px]">show_chart</span>
            <span className="hidden sm:inline">Line</span>
          </button>
        </div>

        {/* Live indicator */}
        <div className="ml-auto flex items-center gap-xs">
          {loading ? (
            <>
              <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
              <span className="text-label-sm text-on-surface-variant font-medium">Loading</span>
            </>
          ) : (
            <>
              <span className="relative flex h-[8px] w-[8px]">
                <span className="absolute inline-flex h-full w-full rounded-full bg-gain opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-[8px] w-[8px] bg-gain" />
              </span>
              <span className="text-label-sm text-gain font-medium">Live</span>
            </>
          )}
        </div>
      </div>

      {/* ── Chart container ── */}
      <div
        ref={chartContainerRef}
        style={{ width: "100%", flexGrow: 1, minHeight: 0 }}
      />
    </div>
    <MetricsGrid stock={stock} candle={hoveredCandle || currentLatest} />
    </>
  );
}

export default memo(ChartPanel);
