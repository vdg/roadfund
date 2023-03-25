
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

      <h3>Game theory dynamics</h3>

      <p>
        The Roadfund contract employs game theory to balance the interests of
        software project creators and users, encouraging consensus-building and
        efficient resource allocation. Let's explore a few illustrative
        scenarios to better understand the contract's game theory dynamics.
      </p>
      <h4>Scenario 1: High user consensus</h4>
      <p>
        In this scenario, a roadmap creator adds several features to their
        software project. Most users agree on the priority of these features,
        resulting in high user consensus. As users pledge their support for
        specific features, the roadmap creator can safely claim funds for
        implementing them, knowing that the challenge duration will most likely
        pass without significant contestation. This scenario demonstrates a Nash
        equilibrium, where both parties benefit from working together and
        prioritizing features with the most support.
      </p>
      <h4>Scenario 2: Low user consensus</h4>
      <p>
        In a low consensus scenario, users have divergent opinions on feature
        priorities. The roadmap creator claims funds for implementing a feature
        that doesn't have broad support, triggering the challenge duration.
        Users opposed to the feature's implementation pledge additional funds to
        contest the claim, surpassing the 25% threshold. The roadmap creator
        must address users' concerns and initiate a new claim, raising the
        contestation threshold and potential penalty. This scenario incentivizes
        the roadmap creator to prioritize features with more substantial user
        support to avoid penalties and build consensus.
      </p>
      <h4>Scenario 3: Collaborative consensus-building</h4>
      <p>
        In this scenario, the roadmap creator recognizes that user consensus is
        not yet achieved and actively engages with users to better understand
        their priorities. By incorporating user feedback and adjusting the
        proposed features, the roadmap creator fosters a more collaborative
        environment. Users feel more invested in the software's direction, and
        the roadmap creator can claim funds with greater confidence, knowing
        that users are less likely to contest their claims. This scenario
        exemplifies how the Roadfund contract encourages collaboration and
        communication between creators and users.
      </p>
      <h4>Scenario 4: Strategic pledging</h4>
      <p>
        In this scenario, users recognize the power of their pledges in
        influencing the project's direction. By strategically pledging for the
        features they care about most, users can sway the roadmap creator's
        decisions. The roadmap creator, in turn, is incentivized to prioritize
        features with significant user support to minimize the risk of
        contestation and penalties. This scenario highlights how the contract
        encourages users to actively engage in the project's development and
        allocate their pledges efficiently.
      </p>
      <p>
        These scenarios illustrate how the Roadfund contract leverages game
        theory to create a balanced system that fosters collaboration,
        consensus-building, and efficient resource allocation, ultimately
        benefiting both software project creators and users.
      </p>

      <h3>Edge cases</h3>

      <p>
        The Roadfund contract also takes into account edge cases, where users or
        creators may attempt to disrupt the system. Let's examine two such
        scenarios and analyze the outcomes based on the contract's rules.
      </p>
      <h4>Scenario 1: Users continuously blocking feature closing</h4>
      <p>
        In this scenario, a group of users consistently contests the closing of
        a specific feature, regardless of the roadmap creator's efforts to
        address their concerns. Each time the creator claims the funds for the
        feature, these users pledge enough funds to surpass the 25% threshold,
        blocking the closing. The contract's rules cause the contestation
        threshold to increase with each new claim, making it progressively more
        challenging for users to block the closing. The escalating penalty for
        the creator also encourages them to engage with the dissenting users and
        address their concerns to avoid continuous contestation. In this
        scenario, the contract's design incentivizes both parties to find a
        consensus while also limiting the ability of users to indefinitely block
        feature closing.
      </p>
      <h4>Scenario 2: Creator persistently re-claims and closes contested features</h4>
      <p>
        In this scenario, a roadmap creator stubbornly re-claims and attempts to
        close a contested feature after each challenge, without addressing
        users' concerns. As the creator initiates new claims, the contestation
        threshold increases, requiring users to pledge more funds to contest the
        claim successfully. However, the creator also faces an escalating
        penalty calculated as 150% of the challenging pledges. This growing
        penalty discourages the creator from continuously re-claiming and
        closing the feature without addressing users' concerns. The contract's
        design encourages the creator to find common ground with users to avoid
        increasingly costly penalties.
      </p>

    </div>
  </div>
</section>


<style lang="scss">

  h3, h4 {
      color: #fff !important;

  }



</style>
