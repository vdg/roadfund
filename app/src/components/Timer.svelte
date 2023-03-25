<script>
  import { onMount, createEventDispatcher } from 'svelte'

  export let end

  const dispatch = createEventDispatcher()

  let fallback = '...'

  const secondsToObject = (seconds) => {
    const o = {}
    o.years = Math.floor(seconds / 31536000)
    o.days = Math.floor((seconds % 31536000) / 86400)
    o.hours = Math.floor(((seconds % 31536000) % 86400) / 3600)
    o.minutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60)
    o.seconds = (((seconds % 31536000) % 86400) % 3600) % 60
    return o
  }

  let table = {}
  export let ended

  onMount(() => {
    const interval = setInterval(() => {
      const duration = end - new Date().getTime()
      ended = duration < 0
      table = secondsToObject(Math.abs(Math.round(duration / 1000)))
      fallback = null
    }, 1000)
    return () => {
      clearInterval(interval)
    }
  })

</script>

<div class=".timer">
  {#if fallback}
  <span>{fallback}</span>
  {:else}
  {#if table.days}<span>{table.days}d</span>{/if}
  {#if table.hours}<span>{table.hours}h</span>{/if}
  {#if table.minutes}<span>{table.minutes}m</span>{/if}
  {#if table.seconds}<span>{table.seconds}s</span>{/if}
  {/if}
</div>
