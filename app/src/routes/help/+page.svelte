
<section class="hero is-primary">
  <div class="hero-body">
    <p class="title mt-4  has-text-centered">
      Help
    </p>

    <div class="content section">


      <h2>1. Introduction</h2>
      <p>
        This user help manual provides a comprehensive guide to using Roadfund,
        a decentralized application for creating and managing software project
        roadmaps. The app allows users to create roadmaps, add features, and
        pledge support for their desired features. Roadmap creators can manage
        their roadmaps, claim funds for implemented features, and close features
        with a consensus-building mechanism.
      </p>
      <h2>2. Getting Started</h2>
      <p>
        To begin, connect your blockchain wallet to the application. Click on
        the "Connect" button located in the top right corner of the app to
        establish a connection.
      </p>
      <p>
        The application consists of two main pages: Home and Roadmap Page, along with several Popups.
      </p>
      <h2>3. Home</h2>
      <p>
        The Home page displays tiles of existing roadmaps (the ones you have
        created on this device or other people's roadmaps you have visited).
        Click on any roadmap tile to navigate to the Roadmap Page. To create a
        new roadmap, click on the "Create New Roadmap" button, which will open a
        popup.
      </p>
      <p>
        This popup allows you to create a new roadmap. Fill in the form with the
        URI metadata of the roadmap, which includes a visual representation and
        a long description of the software project the roadmap is about. Once
        completed, click on the "Submit" button to create your new roadmap. To
        cancel, click the "Cancel" button.
      </p>
      <p>
        The IPFS URL should contain a JSON file with at least 3 properties. The
        property "visual" should be an http/https or IPFS link to a 4:3 ratio
        image. The property "description" should be a brief description of your
        project. The "home" property should be a link to your project website or
        social media account.
      </p>
      <h2>4. Roadmap Page</h2>
      <p>
        The Roadmap Page displays the roadmap metadata on the left and a
        vertical list of all features on the right. If you are the creator of
        the roadmap, you will see an "Add Feature" button on the left. For each
        feature, buttons for pledge, claim, and close will appear based on the
        feature's state and your user rights. A counter of pledges (x/y) will
        show the contested pledges (y). Depending on the state of the feature,
        different dynamic tags and explanations will appear.
      </p>
      <p>Use the "Share" button to let your users know the location of your roadmap.</p>
      <h3>4.1 Pledge Popup</h3>
      <p>
        The Pledge Popup allows you to support a feature or challenge a feature
        claim by pledging funds. Enter the number of tokens you want to pledge
        and click on the "Pledge" button. The price to pay will be displayed,
        and you can confirm the transaction in your blockchain wallet. To
        cancel, click the "Cancel" button. Be aware that if the feature is in
        the challenge period, your pledge will be a contesting one, creating
        penalties for the roadmap creator and potentially blocking the claim if
        the challenge claims exceed 12% of all claims.
      </p>
      <h3>4.2 Claim Popup</h3>
      <p>
        The Claim Popup is available for roadmap creators to claim funds for
        implemented features. Click on the "Claim" button and follow the prompts
        to initiate the claim process. To cancel, click the "Cancel" button.
      </p>
      <h3>4.3 Close Popup</h3>
      <p>
        The Close Popup allows roadmap creators to close a feature. If a penalty
        is applicable, the information will be displayed in the popup. Click on
        the "Close" button to finalize the closure. To cancel, click the
        "Cancel" button.
      </p>

    </div>
  </div>
</section>


<style lang="scss">

  h2, h3, h4 {
      color: #fff !important;

  }

</style>
