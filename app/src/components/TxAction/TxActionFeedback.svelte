<script>
  import { getContext } from 'svelte'

  import { chainData } from 'svelte-ethers-store'

  import tracker from '$stores/tracker.js'

  import { explorer } from '$lib/utils.js'

  import Icon from '$components/Icon.svelte'

  export let disabledHelp

  const txAction = getContext('txAction')

  $: call = $tracker[$txAction.callId] || {}
</script>

{#if $txAction.disabled && disabledHelp}
  {disabledHelp}
{:else if $txAction.control.err}
  <span class="icon-text is-warning">
    <span>{$txAction.control.errMsg || 'checks failed'}</span>
    <Icon name="times" />
  </span>
{:else if call.err}
  <span class="icon-text is-danger">
    <span>{call.errMsg || 'tx failed'}</span>
    <Icon name="times" />
  </span>
{:else if call.step === 12}
  <span class="icon-text" /><span>waiting wallet</span><span class="icon"
    ><span class="loader" />
  </span>
{:else if call.step === 1}
  <span class="icon-text">
    <span class="icon mr-1"><span class="pending" /></span>
    <a
      rel="noreferrer"
      target="_blank"
      href={explorer($chainData, 'tx', call.tx?.hash)}>pending</a>
    <Icon name="external-link" />
  </span>
{:else if call.step === 3}
  <span class="icon-text">
    <Icon name="check-circle" class="mr-0" />
    <a
      rel="noreferrer"
      target="_blank"
      href={explorer($chainData, 'tx', call.tx.hash)}>success</a>
    <Icon name="ExternalLink" />
  </span>
{/if}

<style lang="scss">
  @import '../../scss/_variables.scss';

  .pending {
    border: 0.5em solid #3e6;
    border-radius: 60%;
    border-top: 0.3em solid #63e;
    border-bottom: 0.3em solid #e63;
    width: 1em;
    height: 1em;
    -webkit-animation: spin 1s linear infinite;
    animation: spin 1s linear infinite;
  }

  a {
    color: #fff;
  }

  @-webkit-keyframes spin {
    0% {
      -webkit-transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
