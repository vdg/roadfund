<script>
  import { getContext } from 'svelte'

  import blockchain from '$lib/blockchain.js'

  import {
    getChainDataByChainId,
    signerAddress,
    chainId,
    chainData
  } from 'svelte-ethers-store'
</script>

<nav class="navbar is-white topNav">
  <div class="container">
    <div class="navbar-brand">
      <a class="navbar-item" href="../">
        <span class="is-size-6"><b>Roadfund</b></span>
        <img width="112" height="28" class="is-hidden" />
      </a>
      <div class="navbar-burger burger" data-target="topNav">
        <span />
        <span />
        <span />
      </div>
    </div>
    <div id="topNav" class="navbar-menu">
      <div class="navbar-start">
        <a class="navbar-item" href="/">Home</a>
        <a class="navbar-item" href="/0x1:0x2/">test project</a>
        <a class="navbar-item" href="#">Menu2</a>
      </div>
      <div class="navbar-end">
        <div class="navbar-item">
          {#if $signerAddress}
            {$signerAddress}
          {:else}
            <div class="field is-grouped">
              <p class="control">
                <a
                  class="button is-small"
                  on:click={() => blockchain.connect()}>
                  <span class="icon">
                    <i class="fa fa-user-plus" />
                  </span>
                  <span> Connect </span>
                </a>
              </p>
              <p class="control is-hidden">
                <a class="button is-small is-info is-outlined">
                  <span class="icon">
                    <i class="fa fa-user" />
                  </span>
                  <span>Login</span>
                </a>
              </p>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</nav>

<section class="container mt-6">
  <slot />
</section>

<nav class="navbar is-white is-hidden">
  <div class="container">
    <div class="navbar-menu">
      <div class="navbar-start">
        <a class="navbar-item is-active" href="#">Popular</a>
        <a class="navbar-item" href="#">Recent</a>
        <a class="navbar-item" href="#">Rising</a>
      </div>
      <div class="navbar-end">
        <div class="navbar-item">
          <input class="input" type="search" placeholder="Search forum..." />
        </div>
      </div>
    </div>
  </div>
</nav>
<footer class="footer">
  <div class="container">
    <div class="content has-text-centered">
      <div class="columns is-mobile is-centered">
        <div class="field is-grouped is-grouped-multiline">
          <div class="control">
            <div class="tags has-addons">
              <a
                class="tag is-link"
                href="https://github.com/BulmaTemplates/bulma-templates"
                >Bulma Templates</a>
              <span class="tag is-light">Daniel Supernault</span>
            </div>
          </div>
          <div class="control">
            <div class="tags has-addons">
              <a class="tag is-link">The source code is licensed</a>
              <span class="tag is-light"
                >MIT &nbsp;<i class="fa fa-github" /></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</footer>

<style lang="scss" global>
  @import '../scss/main.scss';
</style>
