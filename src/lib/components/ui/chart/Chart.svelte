<script lang="ts">
    import { init, type ECharts, type EChartsCoreOption, type SetOptionOpts } from "echarts/core";
    import type { Attachment } from "svelte/attachments";
    import type { HTMLAttributes } from "svelte/elements";

    interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
        option: EChartsCoreOption;
        setOptionOpts?: SetOptionOpts;
        chart?: ECharts;
    }

    let { option, setOptionOpts, chart = $bindable(), ...restProps }: Props = $props();

    // Registers nothing: the consumer `use()`s its own charts, components and renderer.
    const mountChart: Attachment<HTMLDivElement> = (element) => {
        const instance = init(element);
        chart = instance;
        const observer = new ResizeObserver(() => instance.resize());
        observer.observe(element);

        // Nested, so a new option re-runs setOption only and never re-inits the chart.
        $effect(() => {
            instance.setOption(option, setOptionOpts);
        });

        return () => {
            observer.disconnect();
            instance.dispose();
            // Clear only our own instance; a consumer may have rebound `chart` meanwhile.
            if (chart === instance) chart = undefined;
        };
    };
</script>

<div {...restProps} {@attach mountChart}></div>
