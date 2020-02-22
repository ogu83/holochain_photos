/// NB: The tryorama config patterns are still not quite stabilized.
/// See the tryorama README [https://github.com/holochain/tryorama]
/// for a potentially more accurate example

const path = require("path");

const {
  Orchestrator,
  Config,
  combine,
  singleConductor,
  localOnly,
  tapeExecutor
} = require("@holochain/tryorama");

process.on("unhandledRejection", error => {
  // Will print "unhandledRejection err is not defined"
  console.error("got unhandledRejection:", error);
});

const dnaPath = path.join(__dirname, "../dist/holochain_photos.dna.json");

const orchestrator = new Orchestrator({
  middleware: combine(
    // use the tape harness to run the tests, injects the tape API into each scenario
    // as the second argument
    tapeExecutor(require("tape")),

    // specify that all "players" in the test are on the local machine, rather than
    // on remote machines
    localOnly,

    // squash all instances from all conductors down into a single conductor,
    // for in-memory testing purposes.
    // Remove this middleware for other "real" network types which can actually
    // send messages across conductors
    singleConductor
  )
});

const dna = Config.dna(dnaPath, "scaffold-test");
const conductorConfig = Config.gen({ myInstanceName: dna });

const PHOTOS_ZOME = "photos_zome";

orchestrator.registerScenario("store and get photos", async (s, t) => {
  const { alice, bob } = await s.players(
    { alice: conductorConfig, bob: conductorConfig },
    true
  );

  // Make a call to a Zome function
  // indicating the function, and passing it an input
  const addr = await alice.call("myInstanceName", PHOTOS_ZOME, "create_photo", {
    entry: { name: "sample photo", data: "somebinary" }
  });

  // Wait for all network activity to settle
  await s.consistency();

  const result = await bob.call("myInstanceName", PHOTOS_ZOME, "get_photo", {
    address: addr.Ok
  });

  // check for equality of the actual and expected results
  t.deepEqual(result, {
    Ok: { App: ["photo", '{"name":"sample photo","data":"somebinary"}'] }
  });
});

orchestrator.registerScenario("get photos", async (s, t) => {
  const { alice } = await s.players({ alice: conductorConfig }, true);
  const addresses = await alice.call(
    "myInstanceName",
    PHOTOS_ZOME,
    "get_photos",
    {}
  );
  console.log(addresses);
});

orchestrator.run();
