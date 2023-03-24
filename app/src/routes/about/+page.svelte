
<section class="hero is-primary">
  <div class="hero-bodyd">
    <p class="title mt-4  has-text-centered">
      About
    </p>

  <div class="content section">
    <p>
      The Roadfund contract is designed to facilitate the creation of roadmaps for
      software projects, allowing users to pledge support for specific features they
      want to see implemented. There are two main types of users: the roadmap
      creators, typically developers of a software project, and the users of that
      software who vote with their pledges for the features they want to see
      implemented first.
    </p>

    <p>
      Roadmap creators can create a new roadmap and add features to it. Each feature
      has a cooling period, during which additional pledges can be made to contest a
      feature claim. Users can pledge funds to specific features, increasing their
      priority for implementation.
    </p>

    <p>
      The contract implements a penalty and incentive system to encourage
      consensus-building and discourage contested features. When the roadmap creator
      claims funds for a specific feature, the cooling period starts, and users can
      still pledge funds to contest the claim. If the total pledges during the cooling
      period amount to 25% or more of the total pledges, the feature is considered
      contested.
    </p>

    <p>
      When closing a feature, the roadmap creator must pay a penalty fee proportional
      to the total cooling pledges. The penalty is calculated as 150% of the cooling
      pledges, which is then sent to a designated penalties recipient. This recipient
      should ideally be a neutral third party, such as the Roadfund project itself or
      any non-profit organization. This encourages the roadmap creator to build
      consensus among users and avoid contesting pledges since they will have to pay a
      higher penalty for contested features.
    </p>

    <p>
      In game theory terms, the penalty and incentive system creates a Nash
      equilibrium where the roadmap creator will strive to generate consensus among
      the users by prioritizing features that have more significant support.
      Simultaneously, users have an incentive to actively pledge for the features they
      truly care about, knowing that their pledges can influence the roadmap creator's
      decisions. The system is designed to balance the interests of both parties,
      leading to a more efficient allocation of resources and a roadmap that better
      reflects the preferences of the software's users.
    </p>
  </div>
  </div>
</section>


<style lang="scss">


</style>
