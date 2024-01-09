use std::{collections::HashMap, ffi::OsString};

use dirs_next::config_dir;
use serde::{Deserialize, Serialize};
use titanpath::AbsoluteSystemPathBuf;
use titanrepo_repository::package_json::{Error as PackageJsonError, PackageJson};

use crate::{
    commands::CommandBase,
    config::{Error as ConfigError, RawTitanJson},
};

const DEFAULT_API_URL: &str = "https://vercel.com/api";
const DEFAULT_LOGIN_URL: &str = "https://vercel.com";
const DEFAULT_TIMEOUT: u64 = 20;

macro_rules! create_builder {
    ($func_name:ident, $property_name:ident, $type:ty) => {
        pub fn $func_name(mut self, value: $type) -> Self {
            self.override_config.$property_name = value;
            self
        }
    };
}

#[derive(Serialize, Deserialize, Default, Debug, PartialEq, Eq, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ConfigurationOptions {
    #[serde(alias = "apiurl")]
    #[serde(alias = "ApiUrl")]
    #[serde(alias = "APIURL")]
    pub(crate) api_url: Option<String>,
    #[serde(alias = "loginurl")]
    #[serde(alias = "LoginUrl")]
    #[serde(alias = "LOGINURL")]
    pub(crate) login_url: Option<String>,
    #[serde(alias = "teamslug")]
    #[serde(alias = "TeamSlug")]
    #[serde(alias = "TEAMSLUG")]
    pub(crate) team_slug: Option<String>,
    #[serde(alias = "teamid")]
    #[serde(alias = "TeamId")]
    #[serde(alias = "TEAMID")]
    pub(crate) team_id: Option<String>,
    pub(crate) token: Option<String>,
    pub(crate) signature: Option<bool>,
    pub(crate) preflight: Option<bool>,
    pub(crate) timeout: Option<u64>,
    pub(crate) enabled: Option<bool>,
}

#[derive(Default)]
pub struct TitanrepoConfigBuilder {
    repo_root: AbsoluteSystemPathBuf,
    override_config: ConfigurationOptions,

    #[cfg(test)]
    global_config_path: Option<AbsoluteSystemPathBuf>,
    #[cfg(test)]
    global_auth_path: Option<AbsoluteSystemPathBuf>,
    #[cfg(test)]
    environment: HashMap<OsString, OsString>,
}

// Getters
impl ConfigurationOptions {
    pub fn api_url(&self) -> &str {
        self.api_url.as_deref().unwrap_or(DEFAULT_API_URL)
    }

    pub fn login_url(&self) -> &str {
        self.login_url.as_deref().unwrap_or(DEFAULT_LOGIN_URL)
    }

    pub fn team_slug(&self) -> Option<&str> {
        self.team_slug.as_deref()
    }

    pub fn team_id(&self) -> Option<&str> {
        self.team_id.as_deref()
    }

    pub fn token(&self) -> Option<&str> {
        self.token.as_deref()
    }

    pub fn signature(&self) -> bool {
        self.signature.unwrap_or_default()
    }

    pub fn enabled(&self) -> bool {
        self.enabled.unwrap_or(true)
    }

    pub fn preflight(&self) -> bool {
        self.preflight.unwrap_or_default()
    }

    pub fn timeout(&self) -> u64 {
        self.timeout.unwrap_or(DEFAULT_TIMEOUT)
    }
}

trait ResolvedConfigurationOptions {
    fn get_configuration_options(self) -> Result<ConfigurationOptions, ConfigError>;
}

impl ResolvedConfigurationOptions for PackageJson {
    fn get_configuration_options(self) -> Result<ConfigurationOptions, ConfigError> {
        match &self.legacy_titan_config {
            Some(legacy_titan_config) => {
                let synthetic_raw_titan_json: RawTitanJson =
                    serde_json::from_value(legacy_titan_config.clone())?;
                synthetic_raw_titan_json.get_configuration_options()
            }
            None => Ok(ConfigurationOptions::default()),
        }
    }
}

impl ResolvedConfigurationOptions for RawTitanJson {
    fn get_configuration_options(self) -> Result<ConfigurationOptions, ConfigError> {
        match &self.remote_cache {
            Some(configuration_options) => {
                configuration_options
                    .clone()
                    .get_configuration_options()
                    // Don't allow token to be set for shared config.
                    .map(|mut configuration_options| {
                        configuration_options.token = None;
                        configuration_options
                    })
            }
            None => Ok(ConfigurationOptions::default()),
        }
    }
}

// Used for global config and local config.
impl ResolvedConfigurationOptions for ConfigurationOptions {
    fn get_configuration_options(self) -> Result<ConfigurationOptions, ConfigError> {
        Ok(self)
    }
}

fn get_lowercased_env_vars() -> HashMap<OsString, OsString> {
    std::env::vars_os()
        .map(|(k, v)| (k.to_ascii_lowercase(), v))
        .collect()
}

fn get_env_var_config(
    environment: &HashMap<OsString, OsString>,
) -> Result<ConfigurationOptions, ConfigError> {
    let mut titan_mapping = HashMap::new();
    titan_mapping.insert(OsString::from("titan_api"), "api_url");
    titan_mapping.insert(OsString::from("titan_login"), "login_url");
    titan_mapping.insert(OsString::from("titan_team"), "team_slug");
    titan_mapping.insert(OsString::from("titan_teamid"), "team_id");
    titan_mapping.insert(OsString::from("titan_token"), "token");
    titan_mapping.insert(OsString::from("titan_remote_cache_timeout"), "timeout");

    // We do not enable new config sources:
    // titan_mapping.insert(String::from("titan_signature"), "signature"); // new
    // titan_mapping.insert(String::from("titan_preflight"), "preflight"); // new
    // titan_mapping.insert(String::from("titan_remote_cache_enabled"), "enabled");

    let mut output_map = HashMap::new();

    titan_mapping.into_iter().try_for_each(
        |(mapping_key, mapped_property)| -> Result<(), ConfigError> {
            if let Some(value) = environment.get(&mapping_key) {
                let converted = value.to_str().ok_or_else(|| {
                    ConfigError::Encoding(
                        // CORRECTNESS: the mapping_key is hardcoded above.
                        mapping_key.to_ascii_uppercase().into_string().unwrap(),
                    )
                })?;
                output_map.insert(mapped_property, converted.to_owned());
                Ok(())
            } else {
                Ok(())
            }
        },
    )?;

    // Process signature
    let signature = if let Some(signature) = output_map.get("signature") {
        match signature.as_str() {
            "0" => Some(false),
            "1" => Some(true),
            _ => return Err(ConfigError::InvalidSignature),
        }
    } else {
        None
    };

    // Process preflight
    let preflight = if let Some(preflight) = output_map.get("preflight") {
        match preflight.as_str() {
            "0" => Some(false),
            "1" => Some(true),
            _ => return Err(ConfigError::InvalidPreflight),
        }
    } else {
        None
    };

    // Process enabled
    let enabled = if let Some(enabled) = output_map.get("enabled") {
        match enabled.as_str() {
            "0" => Some(false),
            "1" => Some(true),
            _ => return Err(ConfigError::InvalidRemoteCacheEnabled),
        }
    } else {
        None
    };

    // Process timeout
    let timeout = if let Some(timeout) = output_map.get("timeout") {
        Some(
            timeout
                .parse::<u64>()
                .map_err(ConfigError::InvalidRemoteCacheTimeout)?,
        )
    } else {
        None
    };

    let output = ConfigurationOptions {
        api_url: output_map.get("api_url").cloned(),
        login_url: output_map.get("login_url").cloned(),
        team_slug: output_map.get("team_slug").cloned(),
        team_id: output_map.get("team_id").cloned(),
        token: output_map.get("token").cloned(),

        // Processed booleans
        signature,
        preflight,
        enabled,

        // Processed numbers
        timeout,
    };

    Ok(output)
}

fn get_override_env_var_config(
    environment: &HashMap<OsString, OsString>,
) -> Result<ConfigurationOptions, ConfigError> {
    let mut vercel_artifacts_mapping = HashMap::new();
    vercel_artifacts_mapping.insert(OsString::from("vercel_artifacts_token"), "token");
    vercel_artifacts_mapping.insert(OsString::from("vercel_artifacts_owner"), "team_id");

    let mut output_map = HashMap::new();

    // Process the VERCEL_ARTIFACTS_* next.
    vercel_artifacts_mapping.into_iter().try_for_each(
        |(mapping_key, mapped_property)| -> Result<(), ConfigError> {
            if let Some(value) = environment.get(&mapping_key) {
                let converted = value.to_str().ok_or_else(|| {
                    ConfigError::Encoding(
                        // CORRECTNESS: the mapping_key is hardcoded above.
                        mapping_key.to_ascii_uppercase().into_string().unwrap(),
                    )
                })?;
                output_map.insert(mapped_property, converted.to_owned());
                Ok(())
            } else {
                Ok(())
            }
        },
    )?;

    let output = ConfigurationOptions {
        api_url: None,
        login_url: None,
        team_slug: None,
        team_id: output_map.get("team_id").cloned(),
        token: output_map.get("token").cloned(),

        signature: None,
        preflight: None,
        enabled: None,
        timeout: None,
    };

    Ok(output)
}

impl TitanrepoConfigBuilder {
    pub fn new(base: &CommandBase) -> Self {
        Self {
            repo_root: base.repo_root.to_owned(),
            override_config: Default::default(),
            #[cfg(test)]
            global_config_path: base.global_config_path.clone(),
            #[cfg(test)]
            global_auth_path: base.global_auth_path.clone(),
            #[cfg(test)]
            environment: Default::default(),
        }
    }

    // Getting all of the paths.
    fn global_config_path(&self) -> Result<AbsoluteSystemPathBuf, ConfigError> {
        #[cfg(test)]
        if let Some(global_config_path) = self.global_config_path.clone() {
            return Ok(global_config_path);
        }

        let config_dir = config_dir().ok_or(ConfigError::NoGlobalConfigPath)?;
        let global_config_path = config_dir.join("titanrepo").join("config.json");
        AbsoluteSystemPathBuf::try_from(global_config_path).map_err(ConfigError::PathError)
    }
    // Location of the auth file for Titanrepo.
    fn global_auth_path(&self) -> Result<AbsoluteSystemPathBuf, ConfigError> {
        #[cfg(test)]
        if let Some(global_auth_path) = self.global_auth_path.clone() {
            return Ok(global_auth_path);
        }

        let config_dir = config_dir().ok_or(ConfigError::NoGlobalConfigPath)?;
        let global_auth_path = config_dir.join("titanrepo").join("auth.json");
        AbsoluteSystemPathBuf::try_from(global_auth_path).map_err(ConfigError::PathError)
    }
    fn local_config_path(&self) -> AbsoluteSystemPathBuf {
        self.repo_root.join_components(&[".titan", "config.json"])
    }
    #[allow(dead_code)]
    fn root_package_json_path(&self) -> AbsoluteSystemPathBuf {
        self.repo_root.join_component("package.json")
    }
    #[allow(dead_code)]
    fn root_titan_json_path(&self) -> AbsoluteSystemPathBuf {
        self.repo_root.join_component("titan.json")
    }

    #[cfg(test)]
    fn get_environment(&self) -> HashMap<OsString, OsString> {
        self.environment.clone()
    }

    #[cfg(not(test))]
    fn get_environment(&self) -> HashMap<OsString, OsString> {
        get_lowercased_env_vars()
    }

    fn get_global_config(&self) -> Result<ConfigurationOptions, ConfigError> {
        let global_config_path = self.global_config_path()?;
        let mut contents = global_config_path
            .read_existing_to_string_or(Ok("{}"))
            .map_err(|error| ConfigError::FailedToReadConfig {
                config_path: global_config_path.clone(),
                error,
            })?;
        if contents.is_empty() {
            contents = String::from("{}");
        }
        let global_config: ConfigurationOptions = serde_json::from_str(&contents)?;
        Ok(global_config)
    }

    fn get_local_config(&self) -> Result<ConfigurationOptions, ConfigError> {
        let local_config_path = self.local_config_path();
        let mut contents = local_config_path
            .read_existing_to_string_or(Ok("{}"))
            .map_err(|error| ConfigError::FailedToReadConfig {
                config_path: local_config_path.clone(),
                error,
            })?;
        if contents.is_empty() {
            contents = String::from("{}");
        }
        let local_config: ConfigurationOptions = serde_json::from_str(&contents)?;
        Ok(local_config)
    }

    create_builder!(with_api_url, api_url, Option<String>);
    create_builder!(with_login_url, login_url, Option<String>);
    create_builder!(with_team_slug, team_slug, Option<String>);
    create_builder!(with_team_id, team_id, Option<String>);
    create_builder!(with_token, token, Option<String>);
    create_builder!(with_signature, signature, Option<bool>);
    create_builder!(with_enabled, enabled, Option<bool>);
    create_builder!(with_preflight, preflight, Option<bool>);
    create_builder!(with_timeout, timeout, Option<u64>);

    pub fn build(&self) -> Result<ConfigurationOptions, ConfigError> {
        // Priority, from least significant to most significant:
        // - shared configuration (package.json .titan)
        // - shared configuration (titan.json)
        // - global configuration (~/.titan/config.json)
        // - local configuration (<REPO_ROOT>/.titan/config.json)
        // - environment variables
        // - CLI arguments
        // - builder pattern overrides.

        let root_package_json = PackageJson::load(&self.repo_root.join_component("package.json"))
            .or_else(|e| {
            if let PackageJsonError::Io(e) = &e {
                if matches!(e.kind(), std::io::ErrorKind::NotFound) {
                    return Ok(Default::default());
                }
            }

            Err(e)
        })?;
        let titan_json =
            RawTitanJson::read(&self.repo_root.join_component("titan.json")).or_else(|e| {
                if let ConfigError::Io(e) = &e {
                    if matches!(e.kind(), std::io::ErrorKind::NotFound) {
                        return Ok(Default::default());
                    }
                }

                Err(e)
            })?;
        let global_config = self.get_global_config()?;
        let local_config = self.get_local_config()?;
        let env_vars = self.get_environment();
        let env_var_config = get_env_var_config(&env_vars)?;
        let override_env_var_config = get_override_env_var_config(&env_vars)?;

        let sources = [
            root_package_json.get_configuration_options(),
            titan_json.get_configuration_options(),
            global_config.get_configuration_options(),
            local_config.get_configuration_options(),
            env_var_config.get_configuration_options(),
            Ok(self.override_config.clone()),
            override_env_var_config.get_configuration_options(),
        ];

        sources.into_iter().try_fold(
            ConfigurationOptions::default(),
            |mut acc, current_source| {
                current_source.map(|current_source_config| {
                    if let Some(api_url) = current_source_config.api_url.clone() {
                        acc.api_url = Some(api_url);
                    }
                    if let Some(login_url) = current_source_config.login_url.clone() {
                        acc.login_url = Some(login_url);
                    }
                    if let Some(team_slug) = current_source_config.team_slug.clone() {
                        acc.team_slug = Some(team_slug);
                    }
                    if let Some(team_id) = current_source_config.team_id.clone() {
                        acc.team_id = Some(team_id);
                    }
                    if let Some(token) = current_source_config.token.clone() {
                        acc.token = Some(token);
                    }
                    if let Some(signature) = current_source_config.signature {
                        acc.signature = Some(signature);
                    }
                    if let Some(enabled) = current_source_config.enabled {
                        acc.enabled = Some(enabled);
                    }
                    if let Some(preflight) = current_source_config.preflight {
                        acc.preflight = Some(preflight);
                    }
                    if let Some(timeout) = current_source_config.timeout {
                        acc.timeout = Some(timeout);
                    }

                    acc
                })
            },
        )
    }
}

#[cfg(test)]
mod test {
    use tempfile::TempDir;

    use super::*;

    #[test]
    fn test_defaults() {
        let defaults: ConfigurationOptions = Default::default();
        assert_eq!(defaults.api_url(), DEFAULT_API_URL);
        assert_eq!(defaults.login_url(), DEFAULT_LOGIN_URL);
        assert_eq!(defaults.team_slug(), None);
        assert_eq!(defaults.team_id(), None);
        assert_eq!(defaults.token(), None);
        assert!(!defaults.signature());
        assert!(defaults.enabled());
        assert!(!defaults.preflight());
        assert_eq!(defaults.timeout(), DEFAULT_TIMEOUT);
    }

    #[test]
    fn test_env_setting() {
        let mut env: HashMap<OsString, OsString> = HashMap::new();

        let titan_api = "https://example.com/api";
        let titan_login = "https://example.com/login";
        let titan_team = "vercel";
        let titan_teamid = "team_nLlpyC6REAqxydlFKbrMDlud";
        let titan_token = "abcdef1234567890abcdef";
        let titan_remote_cache_timeout = 200;

        env.insert("titan_api".into(), titan_api.into());
        env.insert("titan_login".into(), titan_login.into());
        env.insert("titan_team".into(), titan_team.into());
        env.insert("titan_teamid".into(), titan_teamid.into());
        env.insert("titan_token".into(), titan_token.into());
        env.insert(
            "titan_remote_cache_timeout".into(),
            titan_remote_cache_timeout.to_string().into(),
        );

        let config = get_env_var_config(&env).unwrap();
        assert_eq!(titan_api, config.api_url.unwrap());
        assert_eq!(titan_login, config.login_url.unwrap());
        assert_eq!(titan_team, config.team_slug.unwrap());
        assert_eq!(titan_teamid, config.team_id.unwrap());
        assert_eq!(titan_token, config.token.unwrap());
        assert_eq!(titan_remote_cache_timeout, config.timeout.unwrap());
    }

    #[test]
    fn test_override_env_setting() {
        let mut env: HashMap<OsString, OsString> = HashMap::new();

        let vercel_artifacts_token = "correct-horse-battery-staple";
        let vercel_artifacts_owner = "bobby_tables";

        env.insert(
            "vercel_artifacts_token".into(),
            vercel_artifacts_token.into(),
        );
        env.insert(
            "vercel_artifacts_owner".into(),
            vercel_artifacts_owner.into(),
        );

        let config = get_override_env_var_config(&env).unwrap();
        assert_eq!(vercel_artifacts_token, config.token.unwrap());
        assert_eq!(vercel_artifacts_owner, config.team_id.unwrap());
    }

    #[test]
    fn test_env_layering() {
        let repo_root = AbsoluteSystemPathBuf::try_from(TempDir::new().unwrap().path()).unwrap();
        let global_config_path = AbsoluteSystemPathBuf::try_from(
            TempDir::new().unwrap().path().join("nonexistent.json"),
        )
        .unwrap();

        let global_auth_path = AbsoluteSystemPathBuf::try_from(
            TempDir::new().unwrap().path().join("nonexistent-auth.json"),
        )
        .unwrap();

        let titan_teamid = "team_nLlpyC6REAqxydlFKbrMDlud";
        let titan_token = "abcdef1234567890abcdef";
        let vercel_artifacts_owner = "team_SOMEHASH";
        let vercel_artifacts_token = "correct-horse-battery-staple";

        let mut env: HashMap<OsString, OsString> = HashMap::new();
        env.insert("titan_teamid".into(), titan_teamid.into());
        env.insert("titan_token".into(), titan_token.into());
        env.insert(
            "vercel_artifacts_token".into(),
            vercel_artifacts_token.into(),
        );
        env.insert(
            "vercel_artifacts_owner".into(),
            vercel_artifacts_owner.into(),
        );

        let override_config = ConfigurationOptions {
            token: Some("unseen".into()),
            team_id: Some("unseen".into()),
            ..Default::default()
        };

        let builder = TitanrepoConfigBuilder {
            repo_root,
            override_config,
            global_config_path: Some(global_config_path),
            global_auth_path: Some(global_auth_path),
            environment: env,
        };

        let config = builder.build().unwrap();
        assert_eq!(config.team_id().unwrap(), vercel_artifacts_owner);
        assert_eq!(config.token().unwrap(), vercel_artifacts_token);
    }

    #[test]
    fn test_shared_no_token() {
        let mut test_shared_config: RawTitanJson = Default::default();
        let configuration_options = ConfigurationOptions {
            token: Some("IF YOU CAN SEE THIS WE HAVE PROBLEMS".to_string()),
            ..Default::default()
        };
        test_shared_config.remote_cache = Some(configuration_options);

        assert_eq!(
            test_shared_config
                .get_configuration_options()
                .unwrap()
                .token(),
            None
        );
    }
}
