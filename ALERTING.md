# Alerts & Plugin Signing

To activate Grafana's Alerting features, a "backend" plugin is required. Since v7.0, "Grafana now [requires backend plugins to be signed](https://grafana.com/docs/grafana/latest/installation/upgrading/#backend-plugins)." Or you can [turn off signature checks](https://grafana.com/docs/grafana/latest/plugins/plugin-signatures/#allow-unsigned-plugins). If you aren't sure which option is right for you, ask your security department. If you think you don't have one of those, congratulations, *you* are the security department. Read through the information linked above (I'll wait) and choose the relevant section below.

## Building the Backend

### Metadata

There are a few things to modify and install before we're ready to build. The first is `src/plugin.json`, which contains plugin metadata in JSON format for Grafana. We need to add three top-level keys, as shown below:

```
--- a/src/plugin.json
+++ b/src/plugin.json
@@ -2,6 +2,9 @@
   "type": "datasource",
   "name": "IRONdb",
   "id": "circonus-irondb-datasource",
+  "backend": true,
+  "executable": "irondb-backend",
+  "alerting": true,

   "info": {
     "description": "Datasource plugin to pull data from an IRONdb installation.",
```

These three keys tell Grafana 1) `"backend": true` that this plugin contains a backend component, 2) `"executable": "irondb-backend"` what the backend component is named, and 3) `"alerting": true` that the backend component supports alerting.

The frontend needs to be rebuilt to incorporate these new changes as well:

```
$ npm install -g @grafana/toolkit
$ yarn build
```

### The Build

Building the backend component is done using a tool called [mage](https://github.com/magefile/mage#readme). Once you've followed the installation instructions, run the following command, which should show very similar output:

```
$ mage -v
Running dependency: github.com/grafana/grafana-plugin-sdk-go/build.Build.Linux-fm
Running dependency: github.com/grafana/grafana-plugin-sdk-go/build.Build.LinuxARM64-fm
Running dependency: github.com/grafana/grafana-plugin-sdk-go/build.Build.Darwin-fm
Running dependency: github.com/grafana/grafana-plugin-sdk-go/build.Build.Windows-fm
Running dependency: github.com/grafana/grafana-plugin-sdk-go/build.Build.LinuxARM-fm
exec: go build -o dist/irondb-backend_darwin_amd64 -ldflags -w -s -extldflags "-static" ./pkg
exec: go build -o dist/irondb-backend_linux_amd64 -ldflags -w -s -extldflags "-static" ./pkg
exec: go build -o dist/irondb-backend_linux_arm -ldflags -w -s -extldflags "-static" ./pkg
exec: go build -o dist/irondb-backend_linux_arm64 -ldflags -w -s -extldflags "-static" ./pkg
exec: go build -o dist/irondb-backend_windows_amd64.exe -ldflags -w -s -extldflags "-static" ./pkg
```

The backend component, which currently uses a mocked data source returning static data, is now ready to use.

## Plugin Signing

We'll be using "private" signing here, which is the default. This means we need to specify a list of one or more domains where this build is valid for use. The example below uses `localhost`, for simplicity. This should contain the base url your users will load to use the plugin.

The first step is to [create a grafana.com account and api key](https://grafana.com/docs/grafana/latest/developers/plugins/sign-a-plugin/) and set it in your environment.

These steps use the signing tool provided by a globally-installed `@grafana/toolkit`.

```
$ export GRAFANA_PLUGINS=/var/lib/grafana/plugins
$ cd "$GRAFANA_PLUGINS/circonus-irondb-datasource"
$ export GRAFANA_API_KEY=424242424242424242424242424242424242424242424242
$ export GRAFANA_TOOLKIT=$(find $(npm root -g) -type f -iname "grafana-toolkit.js")
$ node $GRAFANA_TOOLKIT plugin:sign --rootUrls http://localhost:3000/
```

## Allow Unsigned Plugins

This option requires a Grafana config change. Find your [config location](https://grafana.com/docs/grafana/latest/administration/configuration/), and make sure your config contains the following:

```
[plugins]
allow_loading_unsigned_plugins = circonus-irondb-datasource
```

## Alerting Test

Let's load the plugin we've configured & built into Grafana running in Docker:

```
(cd $GRAFANA_PLUGINS; docker run --detach --rm --publish 3000:3000 \
  -v "$(pwd)":/var/lib/grafana/plugins --name grafana-plugin grafana/grafana:7.3.7)
```

Now we can hit http://localhost:3000, login with the default `admin`/`admin`, and click `skip` to avoid changing the password. Next click the gear (for Configuration), Data Sources, and Add Data Source. Scroll down to the very bottom, and select IRONdb. Leave all the default values, and click Save & Test.

Click the `+`, then Dashboard, then Add new panel.