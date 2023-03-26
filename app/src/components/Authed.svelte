<script>
  import { createEventDispatcher } from 'svelte'

  import { signerAddress } from 'svelte-ethers-store'

  import Modal from '$components/Modal.svelte'

  import ipfs, { authed } from '$lib/ipfs.js'

  import { gradient } from '$lib/actions/gradient.js'

  let modal
  const control = {}
  const dispatch = createEventDispatcher()

  const sign = async () => {
    try {
      await ipfs.signIn()
      // allow callback from upstream component (modal is already null)
      dispatch('close')
    } catch (e) {
      console.log('sign error', e)
      control.error = true
    }
  }
</script>

{#if $authed}
  <slot />
{:else}
  <Modal bind:this={modal} active={!$authed} on:close noCloseButton={true}>
    <div class="modal-card is-large use:gradient data-hashed={666} xdata-endColor={200}">
      <header class="modal-card-head">
        <p class="modal-card-title">EIP712 signature</p>
        <button class="delete" on:click={modal.onClose} aria-label="close" />
      </header>
      <section class="modal-card-body">
        <p class="heading">Your wallet address is {$signerAddress}</p>

        <h3>
          Kindly sign an EIP712 essage to verify your address.
          This step grants us the power to stash some metadata in the IPFS vault.
        </h3>
      </section>
      <footer class="modal-card-foot">
        <div class="field">
          <button class="button is-primary is-pulled-right" on:click={sign}
            >Sign</button>
          {#if control.error}
            <p class="help is-danger">Failed to verify your signature</p>
          {:else}
            <span class="help is-info"
              >Open wallet to start authentification and terms acceptance.</span>
          {/if}
        </div>
      </footer>
    </div>
  </Modal>
{/if}



<style lang="scss">

  @import '../scss/_variables.scss';

  .modal-card-head, .modal-card-body, .modal-card-foot {
    background: transparent;
  }


</style>
