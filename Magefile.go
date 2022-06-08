//go:build mage
// +build mage

package main

import (
	// mage:import
	"encoding/json"
	build "github.com/grafana/grafana-plugin-sdk-go/build"
	"github.com/magefile/mage/mg"
	"io/ioutil"
	"os"
)

func readFileAsBytes(filePath string) ([]byte, error) {
	byteValue, err := ioutil.ReadFile(filePath)
	if err != nil {
		return nil, err
	}
	return byteValue, nil
}

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

type IrondbDsBuildConfig struct {
	b build.Build // mg.Namespace
}

func (ids *IrondbDsBuildConfig) setTargets() {
	mg.Deps(ids.b.Linux, ids.b.Windows, ids.b.Darwin, ids.b.DarwinARM64, ids.b.LinuxARM64, ids.b.LinuxARM)
}

func updatePluginVersion(version string) {
	f, e := readFileAsBytes("dist/plugin.json")
	if e != nil {
		panic(e.Error())
	}
	p := pluginJson{}
	err := json.Unmarshal(f, &p)
	if err != nil {
		panic(err.Error())
	}
	p.Info.Version = version
	file, _ := json.MarshalIndent(p, "", " ")
	_ = ioutil.WriteFile("dist/plugin.json", file, 0644)
}

func BuildRelease() {
	version := os.Getenv("PLUGIN_VERSION")
	if version != "" {
		updatePluginVersion(version)
	}
	i := IrondbDsBuildConfig{}
	i.setTargets()
}

// Default configures the default target.
var Default = BuildRelease
