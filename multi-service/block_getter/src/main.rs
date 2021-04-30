/*
 * Copyright 2021 Fluence Labs Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
#[macro_use]
extern crate fstrings;

use fluence::module_manifest;
use fluence::MountedBinaryResult;
use fluence::{fce, WasmLoggerBuilder};

mod eth_block_getters;

module_manifest!();

fn main() {
    WasmLoggerBuilder::new().build().ok();
}

#[fce]
#[link(wasm_import_module = "curl_adapter")]
extern "C" {
    pub fn curl_request(curl_cmd: Vec<String>) -> MountedBinaryResult;
}
