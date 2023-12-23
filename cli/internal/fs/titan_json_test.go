package fs

import (
	"os"
	"reflect"
	"sort"
	"strings"
	"testing"

	"github.com/khulnasoft/titan/cli/internal/fs/hash"
	"github.com/khulnasoft/titan/cli/internal/titanpath"
	"github.com/khulnasoft/titan/cli/internal/util"
	"github.com/stretchr/testify/assert"
	"gotest.tools/v3/assert/cmp"
)

func assertIsSorted(t *testing.T, arr []string, msg string) {
	t.Helper()
	if arr == nil {
		return
	}

	copied := make([]string, len(arr))
	copy(copied, arr)
	sort.Strings(copied)
	if !reflect.DeepEqual(arr, copied) {
		t.Errorf("Expected sorted, got %v: %v", arr, msg)
	}
}

func Test_ReadTitanConfigDotEnvUndefined(t *testing.T) {
	testDir := getTestDir(t, "dotenv-undefined")
	titanJSON, titanJSONReadErr := readTitanConfig(testDir.UntypedJoin("titan.json"))
	if titanJSONReadErr != nil {
		t.Fatalf("invalid parse: %#v", titanJSONReadErr)
	}

	// Undefined is nil.
	var typedNil titanpath.AnchoredUnixPathArray

	assert.Equal(t, typedNil, titanJSON.GlobalDotEnv)

	pipelineExpected := Pipeline{
		"build": {
			definedFields:      util.SetFromStrings([]string{}),
			experimentalFields: util.SetFromStrings([]string{}),
			experimental:       taskDefinitionExperiments{},
			TaskDefinition: taskDefinitionHashable{
				Outputs:                 hash.TaskOutputs{},
				Cache:                   true,
				TopologicalDependencies: []string{},
				TaskDependencies:        []string{},
				OutputMode:              util.FullTaskOutput,
				Env:                     []string{},
			},
		},
	}

	assert.Equal(t, pipelineExpected, titanJSON.Pipeline)

	// Snapshot test of serialization.
	bytes, _ := titanJSON.MarshalJSON()
	assert.Equal(t, "{\"globalPassThroughEnv\":null,\"globalDotEnv\":null,\"pipeline\":{\"build\":{\"outputs\":[],\"cache\":true,\"dependsOn\":[],\"inputs\":[],\"outputMode\":\"full\",\"persistent\":false,\"env\":[],\"passThroughEnv\":null,\"dotEnv\":null}},\"remoteCache\":{\"enabled\":true}}", string(bytes))
}

func Test_ReadTitanConfigDotEnvNull(t *testing.T) {
	testDir := getTestDir(t, "dotenv-null")
	titanJSON, titanJSONReadErr := readTitanConfig(testDir.UntypedJoin("titan.json"))
	if titanJSONReadErr != nil {
		t.Fatalf("invalid parse: %#v", titanJSONReadErr)
	}

	// Undefined is nil.
	var typedNil titanpath.AnchoredUnixPathArray

	assert.Equal(t, typedNil, titanJSON.GlobalDotEnv)

	pipelineExpected := Pipeline{
		"build": {
			definedFields:      util.SetFromStrings([]string{}),
			experimentalFields: util.SetFromStrings([]string{}),
			experimental:       taskDefinitionExperiments{},
			TaskDefinition: taskDefinitionHashable{
				Outputs:                 hash.TaskOutputs{},
				Cache:                   true,
				TopologicalDependencies: []string{},
				TaskDependencies:        []string{},
				OutputMode:              util.FullTaskOutput,
				Env:                     []string{},
			},
		},
	}

	assert.Equal(t, pipelineExpected, titanJSON.Pipeline)

	// Snapshot test of serialization.
	bytes, _ := titanJSON.MarshalJSON()
	assert.Equal(t, "{\"globalPassThroughEnv\":null,\"globalDotEnv\":null,\"pipeline\":{\"build\":{\"outputs\":[],\"cache\":true,\"dependsOn\":[],\"inputs\":[],\"outputMode\":\"full\",\"persistent\":false,\"env\":[],\"passThroughEnv\":null,\"dotEnv\":null}},\"remoteCache\":{\"enabled\":true}}", string(bytes))
}

func Test_ReadTitanConfigDotEnvEmpty(t *testing.T) {
	testDir := getTestDir(t, "dotenv-empty")
	titanJSON, titanJSONReadErr := readTitanConfig(testDir.UntypedJoin("titan.json"))
	if titanJSONReadErr != nil {
		t.Fatalf("invalid parse: %#v", titanJSONReadErr)
	}

	assert.Equal(t, make(titanpath.AnchoredUnixPathArray, 0), titanJSON.GlobalDotEnv)

	pipelineExpected := Pipeline{
		"build": {
			definedFields:      util.SetFromStrings([]string{"DotEnv"}),
			experimentalFields: util.SetFromStrings([]string{}),
			experimental:       taskDefinitionExperiments{},
			TaskDefinition: taskDefinitionHashable{
				Outputs:                 hash.TaskOutputs{},
				Cache:                   true,
				TopologicalDependencies: []string{},
				TaskDependencies:        []string{},
				OutputMode:              util.FullTaskOutput,
				Env:                     []string{},
				DotEnv:                  make(titanpath.AnchoredUnixPathArray, 0),
			},
		},
	}

	assert.Equal(t, pipelineExpected, titanJSON.Pipeline)

	// Snapshot test of serialization.
	bytes, _ := titanJSON.MarshalJSON()
	assert.Equal(t, "{\"globalPassThroughEnv\":null,\"globalDotEnv\":[],\"pipeline\":{\"build\":{\"outputs\":[],\"cache\":true,\"dependsOn\":[],\"inputs\":[],\"outputMode\":\"full\",\"persistent\":false,\"env\":[],\"passThroughEnv\":null,\"dotEnv\":[]}},\"remoteCache\":{\"enabled\":true}}", string(bytes))
}

func Test_ReadTitanConfigDotEnvPopulated(t *testing.T) {
	testDir := getTestDir(t, "dotenv-populated")
	titanJSON, titanJSONReadErr := readTitanConfig(testDir.UntypedJoin("titan.json"))
	if titanJSONReadErr != nil {
		t.Fatalf("invalid parse: %#v", titanJSONReadErr)
	}

	assert.Equal(t, titanpath.AnchoredUnixPathArray{"z", "y", "x"}, titanJSON.GlobalDotEnv)

	pipelineExpected := Pipeline{
		"build": {
			definedFields:      util.SetFromStrings([]string{"DotEnv"}),
			experimentalFields: util.SetFromStrings([]string{}),
			experimental:       taskDefinitionExperiments{},
			TaskDefinition: taskDefinitionHashable{
				Outputs:                 hash.TaskOutputs{},
				Cache:                   true,
				TopologicalDependencies: []string{},
				TaskDependencies:        []string{},
				OutputMode:              util.FullTaskOutput,
				Env:                     []string{},
				DotEnv:                  titanpath.AnchoredUnixPathArray{"3", "2", "1"},
			},
		},
	}

	assert.Equal(t, pipelineExpected, titanJSON.Pipeline)

	// Snapshot test of serialization.
	bytes, _ := titanJSON.MarshalJSON()
	assert.Equal(t, "{\"globalPassThroughEnv\":null,\"globalDotEnv\":[\"z\",\"y\",\"x\"],\"pipeline\":{\"build\":{\"outputs\":[],\"cache\":true,\"dependsOn\":[],\"inputs\":[],\"outputMode\":\"full\",\"persistent\":false,\"env\":[],\"passThroughEnv\":null,\"dotEnv\":[\"3\",\"2\",\"1\"]}},\"remoteCache\":{\"enabled\":true}}", string(bytes))
}

func Test_ReadTitanConfigPassThroughEnvUndefined(t *testing.T) {
	testDir := getTestDir(t, "passthrough-undefined")
	titanJSON, titanJSONReadErr := readTitanConfig(testDir.UntypedJoin("titan.json"))
	if titanJSONReadErr != nil {
		t.Fatalf("invalid parse: %#v", titanJSONReadErr)
	}

	// Undefined is nil.
	var typedNil []string

	assert.Equal(t, typedNil, titanJSON.GlobalPassThroughEnv)

	pipelineExpected := Pipeline{
		"build": {
			definedFields:      util.SetFromStrings([]string{}),
			experimentalFields: util.SetFromStrings([]string{}),
			experimental:       taskDefinitionExperiments{},
			TaskDefinition: taskDefinitionHashable{
				Outputs:                 hash.TaskOutputs{},
				Cache:                   true,
				TopologicalDependencies: []string{},
				TaskDependencies:        []string{},
				OutputMode:              util.FullTaskOutput,
				Env:                     []string{},
				PassThroughEnv:          typedNil,
			},
		},
	}

	assert.Equal(t, pipelineExpected, titanJSON.Pipeline)

	// Snapshot test of serialization.
	bytes, _ := titanJSON.MarshalJSON()
	assert.Equal(t, "{\"globalPassThroughEnv\":null,\"globalDotEnv\":null,\"pipeline\":{\"build\":{\"outputs\":[],\"cache\":true,\"dependsOn\":[],\"inputs\":[],\"outputMode\":\"full\",\"persistent\":false,\"env\":[],\"passThroughEnv\":null,\"dotEnv\":null}},\"remoteCache\":{\"enabled\":true}}", string(bytes))
}

func Test_ReadTitanConfigPassThroughEnvNull(t *testing.T) {
	testDir := getTestDir(t, "passthrough-null")
	titanJSON, titanJSONReadErr := readTitanConfig(testDir.UntypedJoin("titan.json"))
	if titanJSONReadErr != nil {
		t.Fatalf("invalid parse: %#v", titanJSONReadErr)
	}

	// Undefined is nil.
	var typedNil []string

	assert.Equal(t, typedNil, titanJSON.GlobalPassThroughEnv)

	pipelineExpected := Pipeline{
		"build": {
			definedFields:      util.SetFromStrings([]string{}),
			experimentalFields: util.SetFromStrings([]string{}),
			experimental:       taskDefinitionExperiments{},
			TaskDefinition: taskDefinitionHashable{
				Outputs:                 hash.TaskOutputs{},
				Cache:                   true,
				TopologicalDependencies: []string{},
				TaskDependencies:        []string{},
				OutputMode:              util.FullTaskOutput,
				Env:                     []string{},
				PassThroughEnv:          typedNil,
			},
		},
	}

	assert.Equal(t, pipelineExpected, titanJSON.Pipeline)

	// Snapshot test of serialization.
	bytes, _ := titanJSON.MarshalJSON()
	assert.Equal(t, "{\"globalPassThroughEnv\":null,\"globalDotEnv\":null,\"pipeline\":{\"build\":{\"outputs\":[],\"cache\":true,\"dependsOn\":[],\"inputs\":[],\"outputMode\":\"full\",\"persistent\":false,\"env\":[],\"passThroughEnv\":null,\"dotEnv\":null}},\"remoteCache\":{\"enabled\":true}}", string(bytes))
}

func Test_ReadTitanConfigPassThroughEnvEmpty(t *testing.T) {
	testDir := getTestDir(t, "passthrough-empty")
	titanJSON, titanJSONReadErr := readTitanConfig(testDir.UntypedJoin("titan.json"))
	if titanJSONReadErr != nil {
		t.Fatalf("invalid parse: %#v", titanJSONReadErr)
	}

	assert.Equal(t, []string{}, titanJSON.GlobalPassThroughEnv)

	pipelineExpected := Pipeline{
		"build": {
			definedFields:      util.SetFromStrings([]string{"PassThroughEnv"}),
			experimentalFields: util.SetFromStrings([]string{}),
			experimental:       taskDefinitionExperiments{},
			TaskDefinition: taskDefinitionHashable{
				Outputs:                 hash.TaskOutputs{},
				Cache:                   true,
				TopologicalDependencies: []string{},
				TaskDependencies:        []string{},
				OutputMode:              util.FullTaskOutput,
				Env:                     []string{},
				PassThroughEnv:          []string{},
			},
		},
	}

	assert.Equal(t, pipelineExpected, titanJSON.Pipeline)

	// Snapshot test of serialization.
	bytes, _ := titanJSON.MarshalJSON()
	assert.Equal(t, "{\"globalPassThroughEnv\":[],\"globalDotEnv\":null,\"pipeline\":{\"build\":{\"outputs\":[],\"cache\":true,\"dependsOn\":[],\"inputs\":[],\"outputMode\":\"full\",\"persistent\":false,\"env\":[],\"passThroughEnv\":[],\"dotEnv\":null}},\"remoteCache\":{\"enabled\":true}}", string(bytes))
}

func Test_ReadTitanConfigPassThroughEnvPopulated(t *testing.T) {
	testDir := getTestDir(t, "passthrough-populated")
	titanJSON, titanJSONReadErr := readTitanConfig(testDir.UntypedJoin("titan.json"))
	if titanJSONReadErr != nil {
		t.Fatalf("invalid parse: %#v", titanJSONReadErr)
	}

	assert.Equal(t, []string{"A", "B", "C"}, titanJSON.GlobalPassThroughEnv)

	pipelineExpected := Pipeline{
		"build": {
			definedFields:      util.SetFromStrings([]string{"PassThroughEnv"}),
			experimentalFields: util.SetFromStrings([]string{}),
			experimental:       taskDefinitionExperiments{},
			TaskDefinition: taskDefinitionHashable{
				Outputs:                 hash.TaskOutputs{},
				Cache:                   true,
				TopologicalDependencies: []string{},
				TaskDependencies:        []string{},
				OutputMode:              util.FullTaskOutput,
				Env:                     []string{},
				PassThroughEnv:          []string{"X", "Y", "Z"},
			},
		},
	}

	assert.Equal(t, pipelineExpected, titanJSON.Pipeline)

	// Snapshot test of serialization.
	bytes, _ := titanJSON.MarshalJSON()
	assert.Equal(t, "{\"globalPassThroughEnv\":[\"A\",\"B\",\"C\"],\"globalDotEnv\":null,\"pipeline\":{\"build\":{\"outputs\":[],\"cache\":true,\"dependsOn\":[],\"inputs\":[],\"outputMode\":\"full\",\"persistent\":false,\"env\":[],\"passThroughEnv\":[\"X\",\"Y\",\"Z\"],\"dotEnv\":null}},\"remoteCache\":{\"enabled\":true}}", string(bytes))
}

func Test_ReadTitanConfig(t *testing.T) {
	testDir := getTestDir(t, "correct")
	titanJSON, titanJSONReadErr := readTitanConfig(testDir.UntypedJoin("titan.json"))

	if titanJSONReadErr != nil {
		t.Fatalf("invalid parse: %#v", titanJSONReadErr)
	}

	assert.EqualValues(t, []string{"AWS_SECRET_KEY"}, titanJSON.GlobalPassThroughEnv)

	pipelineExpected := map[string]BookkeepingTaskDefinition{
		"build": {
			definedFields:      util.SetFromStrings([]string{"Outputs", "OutputMode", "DependsOn", "PassThroughEnv"}),
			experimentalFields: util.SetFromStrings([]string{}),
			experimental:       taskDefinitionExperiments{},
			TaskDefinition: taskDefinitionHashable{
				Outputs:                 hash.TaskOutputs{Inclusions: []string{".next/**", "dist/**"}, Exclusions: []string{"dist/assets/**"}},
				Cache:                   true,
				TopologicalDependencies: []string{"build"},
				TaskDependencies:        []string{},
				OutputMode:              util.NewTaskOutput,
				Env:                     []string{},
				PassThroughEnv:          []string{"GITHUB_TOKEN"},
			},
		},
		"lint": {
			definedFields:      util.SetFromStrings([]string{"Outputs", "OutputMode", "Cache", "DependsOn", "Env"}),
			experimentalFields: util.SetFromStrings([]string{}),
			experimental:       taskDefinitionExperiments{},
			TaskDefinition: taskDefinitionHashable{
				Outputs:                 hash.TaskOutputs{},
				Cache:                   true,
				TopologicalDependencies: []string{},
				TaskDependencies:        []string{},
				OutputMode:              util.NewTaskOutput,
				Env:                     []string{"MY_VAR"},
				PassThroughEnv:          nil,
			},
		},
		"dev": {
			definedFields:      util.SetFromStrings([]string{"OutputMode", "Cache", "PassThroughEnv"}),
			experimentalFields: util.SetFromStrings([]string{}),
			experimental:       taskDefinitionExperiments{},
			TaskDefinition: taskDefinitionHashable{
				Outputs:                 hash.TaskOutputs{},
				Cache:                   false,
				TopologicalDependencies: []string{},
				TaskDependencies:        []string{},
				OutputMode:              util.FullTaskOutput,
				Env:                     []string{},
				PassThroughEnv:          []string{},
			},
		},
		"publish": {
			definedFields:      util.SetFromStrings([]string{"Inputs", "Outputs", "DependsOn", "Cache"}),
			experimentalFields: util.SetFromStrings([]string{}),
			experimental:       taskDefinitionExperiments{},
			TaskDefinition: taskDefinitionHashable{
				Outputs:                 hash.TaskOutputs{Inclusions: []string{"dist/**"}},
				Cache:                   false,
				TopologicalDependencies: []string{"build", "publish"},
				TaskDependencies:        []string{"admin#lint", "build"},
				Inputs:                  []string{"build/**/*"},
				OutputMode:              util.FullTaskOutput,
				Env:                     []string{},
				PassThroughEnv:          nil,
			},
		},
	}

	validateOutput(t, titanJSON, pipelineExpected)
	remoteCacheOptionsExpected := RemoteCacheOptions{"team_id", true, true}
	assert.EqualValues(t, remoteCacheOptionsExpected, titanJSON.RemoteCacheOptions)
}

func Test_LoadTitanConfig_Legacy(t *testing.T) {
	testDir := getTestDir(t, "legacy-only")
	packageJSONPath := testDir.UntypedJoin("package.json")
	rootPackageJSON, pkgJSONReadErr := ReadPackageJSON(packageJSONPath)

	if pkgJSONReadErr != nil {
		t.Fatalf("invalid parse: %#v", pkgJSONReadErr)
	}

	_, titanJSONReadErr := LoadTitanConfig(testDir, rootPackageJSON, false)
	expectedErrorMsg := "Could not find titan.json. Follow directions at https://titan.build/repo/docs to create one: file does not exist"
	assert.EqualErrorf(t, titanJSONReadErr, expectedErrorMsg, "Error should be: %v, got: %v", expectedErrorMsg, titanJSONReadErr)
}

func Test_LoadTitanConfig_BothCorrectAndLegacy(t *testing.T) {
	testDir := getTestDir(t, "both")

	packageJSONPath := testDir.UntypedJoin("package.json")
	rootPackageJSON, pkgJSONReadErr := ReadPackageJSON(packageJSONPath)

	if pkgJSONReadErr != nil {
		t.Fatalf("invalid parse: %#v", pkgJSONReadErr)
	}

	titanJSON, titanJSONReadErr := LoadTitanConfig(testDir, rootPackageJSON, false)

	if titanJSONReadErr != nil {
		t.Fatalf("invalid parse: %#v", titanJSONReadErr)
	}

	pipelineExpected := map[string]BookkeepingTaskDefinition{
		"build": {
			definedFields:      util.SetFromStrings([]string{"Outputs", "OutputMode", "DependsOn"}),
			experimentalFields: util.SetFromStrings([]string{}),
			experimental:       taskDefinitionExperiments{},
			TaskDefinition: taskDefinitionHashable{
				Outputs:                 hash.TaskOutputs{Inclusions: []string{".next/**", "dist/**"}, Exclusions: []string{"dist/assets/**"}},
				Cache:                   true,
				TopologicalDependencies: []string{"build"},
				TaskDependencies:        []string{},
				OutputMode:              util.NewTaskOutput,
				Env:                     []string{},
				PassThroughEnv:          nil,
			},
		},
	}

	validateOutput(t, titanJSON, pipelineExpected)

	remoteCacheOptionsExpected := RemoteCacheOptions{"team_id", true, true}
	assert.EqualValues(t, remoteCacheOptionsExpected, titanJSON.RemoteCacheOptions)
	assert.Equal(t, rootPackageJSON.LegacyTitanConfig == nil, true)
}

func Test_ReadTitanConfig_InvalidEnvDeclarations1(t *testing.T) {
	testDir := getTestDir(t, "invalid-env-1")
	_, titanJSONReadErr := readTitanConfig(testDir.UntypedJoin("titan.json"))

	expectedErrorMsg := "titan.json: You specified \"$A\" in the \"env\" key. You should not prefix your environment variables with \"$\""
	assert.EqualErrorf(t, titanJSONReadErr, expectedErrorMsg, "Error should be: %v, got: %v", expectedErrorMsg, titanJSONReadErr)
}

func Test_ReadTitanConfig_InvalidEnvDeclarations2(t *testing.T) {
	testDir := getTestDir(t, "invalid-env-2")
	_, titanJSONReadErr := readTitanConfig(testDir.UntypedJoin("titan.json"))
	expectedErrorMsg := "titan.json: You specified \"$A\" in the \"env\" key. You should not prefix your environment variables with \"$\""
	assert.EqualErrorf(t, titanJSONReadErr, expectedErrorMsg, "Error should be: %v, got: %v", expectedErrorMsg, titanJSONReadErr)
}

func Test_ReadTitanConfig_InvalidGlobalEnvDeclarations(t *testing.T) {
	testDir := getTestDir(t, "invalid-global-env")
	_, titanJSONReadErr := readTitanConfig(testDir.UntypedJoin("titan.json"))
	expectedErrorMsg := "titan.json: You specified \"$QUX\" in the \"globalEnv\" key. You should not prefix your environment variables with \"$\""
	assert.EqualErrorf(t, titanJSONReadErr, expectedErrorMsg, "Error should be: %v, got: %v", expectedErrorMsg, titanJSONReadErr)
}

func Test_ReadTitanConfig_EnvDeclarations(t *testing.T) {
	testDir := getTestDir(t, "legacy-env")
	titanJSON, titanJSONReadErr := readTitanConfig(testDir.UntypedJoin("titan.json"))

	if titanJSONReadErr != nil {
		t.Fatalf("invalid parse: %#v", titanJSONReadErr)
	}

	pipeline := titanJSON.Pipeline
	assert.EqualValues(t, pipeline["task1"].TaskDefinition.Env, sortedArray([]string{"A"}))
	assert.EqualValues(t, pipeline["task2"].TaskDefinition.Env, sortedArray([]string{"A"}))
	assert.EqualValues(t, pipeline["task3"].TaskDefinition.Env, sortedArray([]string{"A"}))
	assert.EqualValues(t, pipeline["task4"].TaskDefinition.Env, sortedArray([]string{"A", "B"}))
	assert.EqualValues(t, pipeline["task6"].TaskDefinition.Env, sortedArray([]string{"A", "B", "C", "D", "E", "F"}))
	assert.EqualValues(t, pipeline["task7"].TaskDefinition.Env, sortedArray([]string{"A", "B", "C"}))
	assert.EqualValues(t, pipeline["task8"].TaskDefinition.Env, sortedArray([]string{"A", "B", "C"}))
	assert.EqualValues(t, pipeline["task9"].TaskDefinition.Env, sortedArray([]string{"A"}))
	assert.EqualValues(t, pipeline["task10"].TaskDefinition.Env, sortedArray([]string{"A"}))
	assert.EqualValues(t, pipeline["task11"].TaskDefinition.Env, sortedArray([]string{"A", "B"}))

	// check global env vars also
	assert.EqualValues(t, sortedArray([]string{"FOO", "BAR", "BAZ", "QUX"}), sortedArray(titanJSON.GlobalEnv))
	assert.EqualValues(t, sortedArray([]string{"somefile.txt"}), sortedArray(titanJSON.GlobalDeps))
}

func Test_TaskOutputsSort(t *testing.T) {
	inclusions := []string{"foo/**", "bar"}
	exclusions := []string{"special-file", ".hidden/**"}
	taskOutputs := hash.TaskOutputs{Inclusions: inclusions, Exclusions: exclusions}
	taskOutputs.Sort()
	assertIsSorted(t, taskOutputs.Inclusions, "Inclusions")
	assertIsSorted(t, taskOutputs.Exclusions, "Exclusions")

	assert.True(t, cmp.DeepEqual(taskOutputs, hash.TaskOutputs{Inclusions: []string{"bar", "foo/**"}, Exclusions: []string{".hidden/**", "special-file"}})().Success())
}

// Helpers
func validateOutput(t *testing.T, titanJSON *TitanJSON, expectedPipeline Pipeline) {
	t.Helper()
	assertIsSorted(t, titanJSON.GlobalDeps, "Global Deps")
	assertIsSorted(t, titanJSON.GlobalEnv, "Global Env")
	assertIsSorted(t, titanJSON.GlobalPassThroughEnv, "Global Pass Through Env")
	validatePipeline(t, titanJSON.Pipeline, expectedPipeline)
}

func validatePipeline(t *testing.T, actual Pipeline, expected Pipeline) {
	t.Helper()
	// check top level keys
	if len(actual) != len(expected) {
		expectedKeys := []string{}
		for k := range expected {
			expectedKeys = append(expectedKeys, k)
		}
		actualKeys := []string{}
		for k := range actual {
			actualKeys = append(actualKeys, k)
		}
		t.Errorf("pipeline tasks mismatch. got %v, want %v", strings.Join(actualKeys, ","), strings.Join(expectedKeys, ","))
	}

	// check individual task definitions
	for taskName, expectedTaskDefinition := range expected {
		bookkeepingTaskDef, ok := actual[taskName]
		if !ok {
			t.Errorf("missing expected task: %v", taskName)
		}
		actualTaskDefinition := bookkeepingTaskDef.GetTaskDefinition()
		assertIsSorted(t, actualTaskDefinition.Outputs.Inclusions, "Task output inclusions")
		assertIsSorted(t, actualTaskDefinition.Outputs.Exclusions, "Task output exclusions")
		assertIsSorted(t, actualTaskDefinition.Env, "Task env vars")
		assertIsSorted(t, actualTaskDefinition.PassThroughEnv, "Task passthrough env vars")
		assertIsSorted(t, actualTaskDefinition.TopologicalDependencies, "Topo deps")
		assertIsSorted(t, actualTaskDefinition.TaskDependencies, "Task deps")
		assert.EqualValuesf(t, expectedTaskDefinition, bookkeepingTaskDef, "task definition mismatch for %v", taskName)
	}
}

func getTestDir(t *testing.T, testName string) titanpath.AbsoluteSystemPath {
	defaultCwd, err := os.Getwd()
	if err != nil {
		t.Errorf("failed to get cwd: %v", err)
	}
	cwd, err := CheckedToAbsoluteSystemPath(defaultCwd)
	if err != nil {
		t.Fatalf("cwd is not an absolute directory %v: %v", defaultCwd, err)
	}

	return cwd.UntypedJoin("testdata", testName)
}

func sortedArray(arr []string) []string {
	sort.Strings(arr)
	return arr
}
