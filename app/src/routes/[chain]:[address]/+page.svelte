<script>
  import { ethers } from 'ethers'

  import {
    signerAddress,
    provider,
    chainId,
    chainData
  } from 'svelte-ethers-store'

  import { abiEncodeAuth } from "@rougenetwork/v2-core/rouge"

  import Factory from "@rougenetwork/v2-core/Factory.json";
  import Rouge from "@rougenetwork/v2-core/Rouge.json";

  import blockchain from '$lib/blockchain.js'

  import AddFeature from '$components/AddFeature.svelte'

  import roadmap from '$stores/roadmap.js'

  export let data
  $: ({ chain, address } = data)

  $: supported = $signerAddress && blockchain.isSupported($chainId)

  let addActive = false

  let voteActive = 0

</script>

{#if $signerAddress && supported && address}

  <AddFeature bind:active={addActive} {address} />

  <div class="columns">
    <div class="column is-3">

      <div class="card" on:click={() => open(address)}>
        <div class="card-image">
          <figure class="image is-4by3">
            <img src="https://bulma.io/images/placeholders/1280x960.png" alt="Placeholder image">
          </figure>
        </div>
        <div class="card-content">
          <div class="media">
            <div class="media-left">
              <figure class="image is-48x48">
                <img src="https://bulma.io/images/placeholders/96x96.png" alt="Placeholder image">
              </figure>
            </div>
            <div class="media-content">
              <p class="title is-4">John Smith</p>
              <p class="subtitle is-6">@johnsmith</p>
            </div>
          </div>

          <div class="content">
            Lorem ipsum dolor
            Phasellus nec iaculis mauris. <a>@bulmaio</a>.
            <a href="#">#css</a> <a href="#">#responsive</a>
            <br>
            <time datetime="2016-1-1">11:09 PM - 1 Jan 2016</time>
          </div>
        </div>
      </div>

      <button class="mt-4 button is-primary is-block is-alt is-large" on:click={() => {addActive = !addActive}}>Add feature</button>

      <aside class="menu">
        <p class="menu-label">Tags</p>
        <ul class="menu-list">
          <li><span class="tag is-primary is-medium ">Dashboard</span></li>
          <li><span class="tag is-link is-medium ">Customers</span></li>
          <li>
            <span class="tag is-light is-danger is-medium ">Authentication</span>
          </li>
          <li><span class="tag is-dark is-medium ">Payments</span></li>
          <li><span class="tag is-success is-medium ">Transfers</span></li>
          <li><span class="tag is-warning is-medium ">Balance</span></li>
          <li><span class="tag is-medium ">Question</span></li>
        </ul>
      </aside>
    </div>
    <div class="column is-9">
      <div class="box content">
        <article class="post">
          <h4>Bulma: How do you center a button in a box?</h4>
          <div class="media">
            <div class="media-left">
              <p class="image is-32x32">
                <img src="http://bulma.io/images/placeholders/128x128.png" />
              </p>
            </div>
            <div class="media-content">
              <div class="content">
                <p>
                  <a href="#">@jsmith</a> replied 34 minutes ago &nbsp;
                  <span class="tag">Question</span>
                </p>
              </div>
            </div>
            <div class="media-right">
              <span class="has-text-grey-light"
              ><i class="fa fa-comments" /> 1</span>
            </div>
          </div>
        </article>
        <article class="post">
          <h4>How can I make a bulma button go full width?</h4>
          <div class="media">
            <div class="media-left">
              <p class="image is-32x32">
                <img src="http://bulma.io/images/placeholders/128x128.png" />
              </p>
            </div>
            <div class="media-content">
              <div class="content">
                <p>
                  <a href="#">@red</a> replied 40 minutes ago &nbsp;
                  <span class="tag">Question</span>
                </p>
              </div>
            </div>
            <div class="media-right">
              <span class="has-text-grey-light"
              ><i class="fa fa-comments" /> 0</span>
            </div>
          </div>
        </article>
        <article class="post">
          <h4>
            TypeError: Data must be a string or a buffer when trying touse
            vue-bulma-tabs
          </h4>
          <div class="media">
            <div class="media-left">
              <p class="image is-32x32">
                <img src="http://bulma.io/images/placeholders/128x128.png" />
              </p>
            </div>
            <div class="media-content">
              <div class="content">
                <p>
                  <a href="#">@jsmith</a> replied 53 minutes ago &nbsp;
                  <span class="tag">Question</span>
                </p>
              </div>
            </div>
            <div class="media-right">
              <span class="has-text-grey-light"
              ><i class="fa fa-comments" /> 13</span>
            </div>
          </div>
        </article>
        <article class="post">
          <h4>How to vertically center elements in Bulma?</h4>
          <div class="media">
            <div class="media-left">
              <p class="image is-32x32">
                <img src="http://bulma.io/images/placeholders/128x128.png" />
              </p>
            </div>
            <div class="media-content">
              <div class="content">
                <p>
                  <a href="#">@brown</a> replied 3 hours ago &nbsp;
                  <span class="tag">Question</span>
                </p>
              </div>
            </div>
            <div class="media-right">
              <span class="has-text-grey-light"
              ><i class="fa fa-comments" /> 2</span>
            </div>
          </div>
        </article>
        <article class="post">
          <h4>
            I'm trying to use hamburger menu on bulma css, but it doesn't work.
            What is wrong?
          </h4>
          <div class="media">
            <div class="media-left">
              <p class="image is-32x32">
                <img src="http://bulma.io/images/placeholders/128x128.png" />
              </p>
            </div>
            <div class="media-content">
              <div class="content">
                <p>
                  <a href="#">@hamburgler</a> replied 5 hours ago &nbsp;
                  <span class="tag">Question</span>
                </p>
              </div>
            </div>
            <div class="media-right">
              <span class="has-text-grey-light"
              ><i class="fa fa-comments" /> 2</span>
            </div>
          </div>
        </article>
        <article class="post">
          <h4>How to make tiles wrap with Bulma CSS?</h4>
          <div class="media">
            <div class="media-left">
              <p class="image is-32x32">
                <img src="http://bulma.io/images/placeholders/128x128.png" />
              </p>
            </div>
            <div class="media-content">
              <div class="content">
                <p>
                  <a href="#">@rapper</a> replied 3 hours ago &nbsp;
                  <span class="tag">Question</span>
                </p>
              </div>
            </div>
            <div class="media-right">
              <span class="has-text-grey-light"
              ><i class="fa fa-comments" /> 2</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>


{:else}

  <section class="hero is-medium is-primary">
    <div class="hero-body has-text-centered">

      {#if $signerAddress}
        <p class="title">
          Sorry, non supported network
        </p>
      {:else}
        <p class="title">
          Please connect to your wallet
        </p>
      {/if}

    </div>
  </section>

{/if}
