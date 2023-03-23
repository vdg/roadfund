<script>
  import { onMount } from 'svelte'

  import { chainId, chainData } from 'svelte-ethers-store'

  import Modal from '$components/Modal.svelte'

  export let active

  let modal

  let data = {}

  const control = {
    isWaiting: false,
    isLoading: false,
    error: {}
  }

  export const add = async () => {
    control.error = {}

    if (!data.pledge) {
      control.error.pledge = 'This field is required'
    }
    if (!data.description) {
      control.error.description = 'This field is required'
    }


    return true
  }

  const cancel = async () => {
    if (modal) modal.close()
  }

</script>



<Modal bind:this={modal} bind:active noCloseButton={true}>
  <div class="modal-card is-large">
    <section class="modal-card-body has-background-light">
      <h2 class="title">Add a feature</h2>

      <div class="column is-one-quarter">
        <div class="field">
          <label for="pledge" class="label">Pledge (in ETH)</label>
          <p class="control">
            <input
              id="pledge"
              class="input"
              class:is-danger={control.error.pledge}
              type="number"
              placeholder="pledge"
              bind:value={data.pledge} />
          </p>
          {#if control.error.pledge}<p class="help is-danger">
            {control.error.pledge}
          </p>{/if}
        </div>
      </div>

      <div class="column is-two-thirds">
        <div class="field">
          <label for="label" class="label">Description</label>
          <p class="control">
            <input
              id="description"
              class="input"
              class:is-danger={control.error.description}
                  type="text"
              placeholder="A feature that need to be implemented"
              bind:value={data.description} />
          </p>
          {#if control.error.description}<p class="help is-danger">
            {control.error.description}
          </p>{/if}
        </div>
      </div>

    </section>
    <footer class="modal-card-foot">
      {#if control.hasErrors}<p class="help is-danger pr-3">
        Please fix errors above
      </p>{/if}
      <button class="button is-black" on:click={cancel}>Cancel</button>
      <button class="button is-primary" on:click={add}>Add</button>
    </footer>
  </div>
</Modal>

