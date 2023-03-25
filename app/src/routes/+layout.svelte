<script>
  import { getContext } from 'svelte'

  import blockchain from '$lib/blockchain.js'

  import {
    getChainDataByChainId,
    signerAddress,
    chainId,
    chainData
  } from 'svelte-ethers-store'

  let menu

  import { formatAddress } from '$lib/utils.js'

</script>

<nav class="navbar topNav is-transparent">
  <div class="container">
    <div class="navbar-brand">
      <a class="navbar-item" href="/">
        <span class="is-size-6"><b>Roadfund</b></span>
        <img width="112" height="28" class="is-hidden" />
      </a>
      <div class="navbar-burger burger" class:is-active={menu}         on:click={() => {
                                                                                menu = !menu
                                                                                }}

           data-target="topNav">
        <span />
        <span />
        <span />
      </div>
    </div>
    <div id="topNav" class="navbar-menu" class:is-active={menu}>
      <div class="navbar-start">
        <a class="navbar-item" href="/help">Help</a>
        <a class="navbar-item" href="/about">About</a>
      </div>
      <div class="navbar-end">
        <div class="navbar-item">
          {#if $signerAddress}
            {formatAddress($signerAddress)}
          {:else}
            <div class="field is-grouped">
              <p class="control">
                <a
                  class="button shadowed"
                  on:click={() => blockchain.connect()}>
                  <span class="icon">
                    <i class="fa fa-link" />
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

<section class="container is-max-widescreen my-6 px-3">
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

<footer class="footer is-hidden">
  <div class="container">
    <div class="content has-text-centered ">
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

  body {
    background: linear-gradient(135deg, #000000, #ffffff);
    color: #fff;
    min-height: calc(100vh - 1.6em);
  }

  .modal-card-foot {
    justify-content: flex-end;
  }

  .shadowed {
    color: #eee;
    text-shadow: 3px 3px 3px rgba(0, 0, 0, 0.6);
    &:hover,
    &.is-hovered {
      color: #fff;
      text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.3);
    }
  }

  $primary: #000;
  $primary-hover: #fff;

  .button {
    font-weight: $weight-semibold;

    &.is-primary {
      background-color: $primary;
      color: $primary-hover;

      &:hover,
      &.is-hovered {
        background-color: $primary-hover;
        color: $primary;
      }
      &.is-inverted {
        background-color: transparent;
        border-color: $primary;
        color: $primary;
        &:hover,
        &.is-hovered {
          background-color: transparent;
          border-color: $primary-hover;
          color: $primary-hover;
        }
      }
    }


  }



</style>
