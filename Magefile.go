//go:build mage
// +build mage

package main

import (
	// mage:import
	json "encoding/json"
	build "github.com/grafana/grafana-plugin-sdk-go/build"
	"github.com/magefile/mage/mg"
	"io/ioutil"
	"os"
	"strings"
)

// readFileAsBytes is a helper function to read a filepath as bytes
func readFileAsBytes(filePath string) ([]byte, error) {
	byteValue, err := ioutil.ReadFile(filePath)
	if err != nil {
		return nil, err
	}
	return byteValue, nil
}

// pluginJson matches the structure of the dist/plugin.json file before
// it's version field value is replaced if this is a release
type pluginJson struct {
	Type       string `json:"type"`
	Name       string `json:"name"`
	ID         string `json:"id"`
	Backend    bool   `json:"backend"`
	Executable string `json:"executable"`
	Alerting   bool   `json:"alerting"`
	Info       struct {
		Description string `json:"description"`
		Author      struct {
			Name string `json:"name"`
			URL  string `json:"url"`
		} `json:"author"`
		Keywords []string `json:"keywords"`
		Logos    struct {
			Small string `json:"small"`
			Large string `json:"large"`
		} `json:"logos"`
		Links []struct {
			Name string `json:"name"`
			URL  string `json:"url"`
		} `json:"links"`
		Version string `json:"version"`
		Updated string `json:"updated"`
	} `json:"info"`
	Dependencies struct {
		GrafanaDependency string        `json:"grafanaDependency"`
		Plugins           []interface{} `json:"plugins"`
	} `json:"dependencies"`
	Metrics     bool `json:"metrics"`
	Annotations bool `json:"annotations"`
}

// IrondbDsBuildConfig holds config for the circonus-irondb-datasource build
type IrondbDsBuildConfig struct {
	B build.Build // mg.Namespace
	PluginJsonPath string // path to the plugin.json file
}

// updatePluginVersion updates the plugin.json version field value with
// the value of the environment variable PLUGIN_VERSION for tags that start with
// v
func (ids *IrondbDsBuildConfig) updatePluginVersion() {
	f, e := readFileAsBytes(ids.PluginJsonPath)
	if e != nil {
		panic(e.Error())
	}
	p := pluginJson{}
	err := json.Unmarshal(f, &p)
	if err != nil {
		panic(err.Error())
	}
	version := os.Getenv("PLUGIN_VERSION")
	if strings.HasPrefix(p.Info.Version, "v") && version != "" {
			p.Info.Version = version
	}
	file, _ := json.MarshalIndent(p, "", " ")
	_ = ioutil.WriteFile(ids.PluginJsonPath, file, 0644)
}

// setTargets sets the platform builds
func (ids *IrondbDsBuildConfig) setTargets() {
	mg.Deps(ids.B.Linux, ids.B.Windows, ids.B.Darwin, ids.B.DarwinARM64, ids.B.LinuxARM64, ids.B.LinuxARM)
}

func BuildRelease() {
	i := IrondbDsBuildConfig{}
	i.updatePluginVersion()
	i.setTargets()
}

// Default configures the default target.
var Default = BuildRelease
