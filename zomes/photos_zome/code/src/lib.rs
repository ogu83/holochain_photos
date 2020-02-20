#![feature(proc_macro_hygiene)]
#[macro_use]
extern crate hdk;
extern crate hdk_proc_macros;
extern crate serde;
#[macro_use]
extern crate serde_derive;
extern crate serde_json;
#[macro_use]
extern crate holochain_json_derive;
use hdk::prelude::LinkMatch;

use hdk::{
    entry_definition::ValidatingEntryType,
    error::ZomeApiResult,
    AGENT_ADDRESS,
};
use hdk::holochain_core_types::{
    entry::Entry,
    dna::entry_types::Sharing,
};

use hdk::holochain_json_api::{
    json::JsonString,
    error::JsonError
};

use hdk::holochain_persistence_api::{
    cas::content::Address
};

use hdk_proc_macros::zome;

// see https://developer.holochain.org/api/0.0.42-alpha5/hdk/ for info on using the hdk library

// This is a sample zome that defines an entry type "MyEntry" that can be committed to the
// agent's chain via the exposed function create_my_entry

#[derive(Serialize, Deserialize, Debug, self::DefaultJson,Clone)]
pub struct Photo {
    name: String,
    data: String
}

#[zome]
mod photos_zome {

    #[init]
    fn init() {
        Ok(())
    }

    #[validate_agent]
    pub fn validate_agent(validation_data: EntryValidationData<AgentId>) {
        Ok(())
    }

    #[entry_def]
     fn photo_entry_def() -> ValidatingEntryType {
        entry!(
            name: "photo",
            description: "photo data",
            sharing: Sharing::Private,
            validation_package: || {
                hdk::ValidationPackageDefinition::Entry
            },
            validation: | _validation_data: hdk::EntryValidationData<Photo>| {
                Ok(())
            },
            links: [
              from!( // to query all the courses of a user(all courses that a user is the teacher or owner of)
                  "%agent_id",
                  link_type: "user->photos2",
                  validation_package: || {
                      hdk::ValidationPackageDefinition::Entry
                  }              ,
                  validation: | _validation_data: hdk::LinkValidationData | {
                    Ok(())
                  }
              )
            ]
        )
    }

    #[zome_fn("hc_public")]
    fn create_photo(photo: Photo) -> ZomeApiResult<Address> {
        let entry = Entry::App("photo".into(), photo.into());
        let address = hdk::commit_entry(&entry)?;

        hdk::link_entries(&AGENT_ADDRESS, &address, "user->photos2", "")?;

        Ok(address)
    }

    #[zome_fn("hc_public")]
    fn get_photo(address: Address) -> ZomeApiResult<Photo> {
        // hdk::get_entry(&address)
        hdk::utils::get_as_type(address)
    }

    #[zome_fn("hc_public")]
    fn get_photos() -> ZomeApiResult<Vec<Address>> {
      let photo_links = hdk::get_links(
        &AGENT_ADDRESS,
        LinkMatch::Exactly("user->photos2"),
        LinkMatch::Any,
      )?;
      hdk::debug("write a message to the logs");

      Ok(photo_links.addresses())
    }

    #[zome_fn("hc_public")]
    pub fn hello_holo() -> ZomeApiResult<String> {
        Ok("Hello Holo".into())
    }
}
