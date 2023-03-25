
<section class="hero is-primary">
  <div class="hero-bodyd">
    <p class="title mt-4  has-text-centered">
      About
    </p>

    <div class="content section">

      <p>
        The Roadfund decentralized app/contract is designed to facilitate the
        creation of roadmaps for software projects, allowing users to pledge
        support for specific features they want to see implemented. There are
        two main types of users: the roadmap creators, typically developers of a
        software project, and the users of that software who vote with their
        pledges for the features they want to see implemented first.
      </p>
      <p>
        Roadmap creators can create a new roadmap and add features to it. Each
        feature has a challenge duration, during which additional pledges can be
        made to challenge a feature claim. Users can pledge funds to specific
        features, increasing their priority for implementation. Pledges are
        represented as ERC721 tokens, enabling users to keep them as collectible
        items.
      </p>
      <p>
        The contract implements a penalty and incentive system to encourage
        consensus-building and discourage roadmap creators from claiming pledged
        funds without proper cause. When the roadmap creator claims funds for a
        specific feature they deem implemented, the challenge duration begins,
        allowing users to continue pledging funds to challenge the claim. If the
        total pledges during the challenge duration amount to 25% or more of the
        total pledges, the feature is considered contested, and the funds cannot
        be transferred without initiating a new claim (and a new challenge duration).
      </p>
      <p>
        When closing a feature after a challenge duration, even if the feature has
        not been successfully contested, the roadmap creator must pay a penalty
        fee proportional to the total challenge pledges. The penalty is
        calculated as 150% of the challenging pledges, which is then sent to a
        designated penalties recipient. This recipient should ideally be a
        neutral third party, such as the Roadfund project itself or any
        non-profit organization. This system encourages the roadmap creator to
        build consensus among users and avoid triggering challenge pledges, as
        they will have to pay a higher penalty in such cases.
      </p>
      <p>
        If a feature becomes contested during the challenge duration, the
        roadmap creator should address the concerns of the users who challenged
        the feature before attempting a new claim. Because a new claim restarts
        the challenge duration and raises the threshold for a successful contest
        (thus enabling even higher penalty if users continue to challenge the
        completion of the feature in the new challenge duration). This iterative
        contest can continue until real consensus is reached, and a challenge
        duration ends with the total challenge pledges below the 25% threshold.
        This process fosters collaboration and communication between the roadmap
        creator and users, ensuring that the software project evolves in a
        direction that meets the needs and preferences of its user base.
      </p>
      <p>
        In game theory terms, the penalty and incentive system creates a Nash
        equilibrium where the roadmap creator will strive to generate consensus
        among users by prioritizing features that have more significant support.
        Simultaneously, users have an incentive to actively pledge for the
        features they genuinely care about, knowing that their pledges can
        influence the roadmap creator's decisions. The system is designed to
        balance the interests of both parties, leading to a more efficient
        allocation of resources and a roadmap that better reflects the
        preferences of the software's users.
      </p>
      <p>
        Roadfund is fully permission-less with zero backend component. Roadfund
        is open source, licenced under GPL v3, and build using the following
        open source libs and framework:
      </p>
      <ul>
      </ul>

    </div>
  </div>
</section>


<style lang="scss">


</style>
