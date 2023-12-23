TITAN_VERSION = $(shell cat ../version.txt | sed -n '1 p')
TITAN_TAG = $(shell cat ../version.txt | sed -n '2 p')

EXT :=
ifeq ($(OS),Windows_NT)
	UNAME := Windows
	EXT = .exe
else
	UNAME := $(shell uname -s)
endif

GOARCH:=$(shell go env GOARCH | xargs)
GOOS:=$(shell go env GOOS | xargs)

# Strip debug info
GO_FLAGS += "-ldflags=-s -w"

# Avoid embedding the build path in the executable for more reproducible builds
GO_FLAGS += -trimpath

CLI_DIR = $(shell pwd)

# allow opting in to the rust codepaths
GO_TAG ?= rust

GO_FILES = $(shell find . -name "*.go")
SRC_FILES = $(shell find . -name "*.go" | grep -v "_test.go")
GENERATED_FILES = internal/titandprotocol/titand.pb.go internal/titandprotocol/titand_grpc.pb.go

# We do not set go-titan as a dependency because the Rust build.rs
# script will call it for us and copy over the binary
titan:
	cargo build -p titan

titan-prod:
	cargo build --release --manifest-path ../crates/titanrepo/Cargo.toml

titan-capnp:
	cd ../crates/titanrepo-lib/src/hash && capnp compile -I std -ogo proto.capnp && mv ./proto.capnp.go ../../../../cli/internal/fs/hash/capnp

go-titan$(EXT): $(GENERATED_FILES) $(SRC_FILES) go.mod titanrepo-ffi-install
	CGO_ENABLED=1 go build -tags $(GO_TAG) -o go-titan$(EXT) ./cmd/titan


.PHONY: titanrepo-ffi-install
titanrepo-ffi-install: titanrepo-ffi titanrepo-ffi-copy-bindings
	cp ../crates/titanrepo-ffi/target/debug/libtitanrepo_ffi.a ./internal/ffi/libtitanrepo_ffi_$(GOOS)_$(GOARCH).a

.PHONY: titanrepo-ffi
titanrepo-ffi:
	cd ../crates/titanrepo-ffi && cargo build --target-dir ./target

.PHONY: titanrepo-ffi-copy-bindings
titanrepo-ffi-copy-bindings:
	cp ../crates/titanrepo-ffi/bindings.h ./internal/ffi/bindings.h

#
# ffi cross compiling
#
# these targets are used to build the ffi library for each platform
# when doing a release. they _may_ work on your local machine, but
# they're not intended to be used for development.
#

.PHONY: titanrepo-ffi-install-windows-amd64
titanrepo-ffi-install-windows-amd64: titanrepo-ffi-windows-amd64 titanrepo-ffi-copy-bindings
	cp ../crates/titanrepo-ffi/target/x86_64-pc-windows-gnu/release/libtitanrepo_ffi.a ./internal/ffi/libtitanrepo_ffi_windows_amd64.a

.PHONY: titanrepo-ffi-install-darwin-arm64
titanrepo-ffi-install-darwin-arm64: titanrepo-ffi-darwin-arm64 titanrepo-ffi-copy-bindings
	cp ../crates/titanrepo-ffi/target/aarch64-apple-darwin/release/libtitanrepo_ffi.a ./internal/ffi/libtitanrepo_ffi_darwin_arm64.a

.PHONY: titanrepo-ffi-install-darwin-amd64
titanrepo-ffi-install-darwin-amd64: titanrepo-ffi-darwin-amd64 titanrepo-ffi-copy-bindings
	cp ../crates/titanrepo-ffi/target/x86_64-apple-darwin/release/libtitanrepo_ffi.a ./internal/ffi/libtitanrepo_ffi_darwin_amd64.a

.PHONY: titanrepo-ffi-install-linux-arm64
titanrepo-ffi-install-linux-arm64: titanrepo-ffi-linux-arm64 titanrepo-ffi-copy-bindings
	cp ../crates/titanrepo-ffi/target/aarch64-unknown-linux-musl/release/libtitanrepo_ffi.a ./internal/ffi/libtitanrepo_ffi_linux_arm64.a

.PHONY: titanrepo-ffi-install-linux-amd64
titanrepo-ffi-install-linux-amd64: titanrepo-ffi-linux-amd64 titanrepo-ffi-copy-bindings
	cp ../crates/titanrepo-ffi/target/x86_64-unknown-linux-musl/release/libtitanrepo_ffi.a ./internal/ffi/libtitanrepo_ffi_linux_amd64.a

.PHONY: titanrepo-ffi-windows-amd64
titanrepo-ffi-windows-amd64:
	cd ../crates/titanrepo-ffi && cargo build --release --target-dir ./target --target x86_64-pc-windows-gnu

.PHONY: titanrepo-ffi-darwin-arm64
titanrepo-ffi-darwin-arm64:
	cd ../crates/titanrepo-ffi && cargo build --release --target-dir ./target --target aarch64-apple-darwin

.PHONY: titanrepo-ffi-darwin-amd64
titanrepo-ffi-darwin-amd64:
	cd ../crates/titanrepo-ffi && cargo build --release --target-dir ./target --target x86_64-apple-darwin

.PHONY: titanrepo-ffi-linux-arm64
titanrepo-ffi-linux-arm64:
	cd ../crates/titanrepo-ffi && CC="zig cc -target aarch64-linux-musl" cargo build --release --target-dir ./target --target aarch64-unknown-linux-musl

.PHONY: titanrepo-ffi-linux-amd64
titanrepo-ffi-linux-amd64:
	cd ../crates/titanrepo-ffi && CC="zig cc -target x86_64-linux-musl" cargo build --release --target-dir ./target --target x86_64-unknown-linux-musl

#
# end
#

.PHONY: titanrepo-ffi-proto
titanrepo-ffi-proto:
	protoc -I../crates/ ../crates/titanrepo-ffi/messages.proto --go_out=./internal/

protoc: internal/titandprotocol/titand.proto
	protoc --go_out=. --go_opt=paths=source_relative \
		--go-grpc_out=. --go-grpc_opt=paths=source_relative \
		internal/titandprotocol/titand.proto

$(GENERATED_FILES): internal/titandprotocol/titand.proto
	make protoc

compile-protos: $(GENERATED_FILES)

check-go-version:
	@go version | grep ' go1\.18\.0 ' || (echo 'Please install Go version 1.18.0' && false)

# This "TITAN_RACE" variable exists at the request of a user on GitHub who
# wants to run "make test-go" on an unsupported version of macOS (version 10.9).
# Go's race detector does not run correctly on that version. With this flag
# you can run "TITAN_RACE= make test-go" to disable the race detector.
TITAN_RACE ?= -race

ifeq ($(UNAME), Windows)
	TITAN_RACE=
endif

clean-go:
	go clean -testcache -r

test-go: $(GENERATED_FILES) $(GO_FILES) go.mod go.sum titanrepo-ffi-install
	go test $(TITAN_RACE) -tags $(GO_TAG) ./...

# protos need to be compiled before linting, since linting needs to pick up
# some types from the generated code
lint-go: $(GENERATED_FILES) $(GO_FILES) go.mod go.sum
	golangci-lint run --new-from-rev=main

fmt-go: $(GO_FILES) go.mod go.sum
	go fmt ./...

install: | ./package.json
	pnpm install --filter=cli

corepack:
	which corepack || npm install -g corepack@latest
	corepack enable

cmd/titan/version.go: ../version.txt
	# Update this atomically to avoid issues with this being overwritten during use
	node -e 'console.log(`package main\n\nconst titanVersion = "$(TITAN_VERSION)"`)' > cmd/titan/version.go.txt
	mv cmd/titan/version.go.txt cmd/titan/version.go

build: install
	cd $(CLI_DIR)/../ && pnpm build:titan
	cd $(CLI_DIR)/../ && pnpm install --filter=create-titan && pnpm titan-prebuilt build --filter=create-titan...
	cd $(CLI_DIR)/../ && pnpm install --filter=@titan/codemod && pnpm titan-prebuilt build --filter=@titan/codemod...
	cd $(CLI_DIR)/../ && pnpm install --filter=titan-ignore && pnpm titan-prebuilt build --filter=titan-ignore...
	cd $(CLI_DIR)/../ && pnpm install --filter=@titan/workspaces && pnpm titan-prebuilt build --filter=@titan/workspaces...
	cd $(CLI_DIR)/../ && pnpm install --filter=@titan/gen && pnpm titan-prebuilt build --filter=@titan/gen...
	cd $(CLI_DIR)/../ && pnpm install --filter=eslint-plugin-titan && pnpm titan-prebuilt build --filter=eslint-plugin-titan...
	cd $(CLI_DIR)/../ && pnpm install --filter=eslint-config-titan && pnpm titan-prebuilt build --filter=eslint-config-titan...
	cd $(CLI_DIR)/../ && pnpm install --filter=@titan/types && pnpm titan-prebuilt build --filter=@titan/types...

.PHONY: prepublish
prepublish: compile-protos cmd/titan/version.go
	make -j3 bench/titan test-go

.PHONY: publish-titan-cross
publish-titan-cross: prepublish
	goreleaser release --rm-dist -f cross-release.yml

.PHONY: publish-titan-darwin
publish-titan-darwin: prepublish
	goreleaser release --rm-dist -f darwin-release.yml

.PHONY: snapshot-titan-cross
snapshot-titan-cross:
	goreleaser release --snapshot --rm-dist -f cross-release.yml

.PHONY: snapshot-titan-darwin
snapshot-titan-darwin:
	goreleaser release --snapshot --rm-dist -f darwin-release.yml

.PHONY: snapshot-lib-titan-darwin
snapshot-lib-titan-darwin:
	goreleaser release --snapshot --rm-dist -f darwin-lib.yml

.PHONY: snapshot-lib-titan-cross
snapshot-lib-titan-cross:
	goreleaser release --snapshot --rm-dist -f cross-lib.yml

.PHONY: build-lib-titan-darwin
build-lib-titan-darwin:
	goreleaser release --rm-dist -f darwin-lib.yml

.PHONY: build-go-titan-darwin
build-go-titan-darwin:
	goreleaser release --rm-dist -f darwin-release.yml

.PHONY: build-go-titan-cross
build-go-titan-cross:
	goreleaser release --rm-dist -f cross-release.yml

.PHONY: build-lib-titan-cross
build-lib-titan-cross:
	goreleaser release --rm-dist -f cross-lib.yml

.PHONY: stage-release
stage-release: cmd/titan/version.go
	echo "Version: $(TITAN_VERSION)"
	echo "Tag: $(TITAN_TAG)"
	cat $(CLI_DIR)/../version.txt
	git diff -- $(CLI_DIR)/../version.txt
	git status
	@test "" = "`git cherry`" || (echo "Refusing to publish with unpushed commits" && false)

	# Stop if versions are not updated.
	@test "" != "`git diff -- $(CLI_DIR)/../version.txt`" || (echo "Refusing to publish with unupdated version.txt" && false)
	@test "" != "`git diff -- $(CLI_DIR)/cmd/titan/version.go`" || (echo "Refusing to publish with unupdated version.go" && false)

	# Prepare the packages.
	cd $(CLI_DIR)/../packages/titan && pnpm version "$(TITAN_VERSION)" --allow-same-version
	cd $(CLI_DIR)/../packages/create-titan && pnpm version "$(TITAN_VERSION)" --allow-same-version
	cd $(CLI_DIR)/../packages/titan-codemod && pnpm version "$(TITAN_VERSION)" --allow-same-version
	cd $(CLI_DIR)/../packages/titan-ignore && pnpm version "$(TITAN_VERSION)" --allow-same-version
	cd $(CLI_DIR)/../packages/titan-workspaces && pnpm version "$(TITAN_VERSION)" --allow-same-version
	cd $(CLI_DIR)/../packages/titan-gen && pnpm version "$(TITAN_VERSION)" --allow-same-version
	cd $(CLI_DIR)/../packages/eslint-plugin-titan && pnpm version "$(TITAN_VERSION)" --allow-same-version
	cd $(CLI_DIR)/../packages/eslint-config-titan && pnpm version "$(TITAN_VERSION)" --allow-same-version
	cd $(CLI_DIR)/../packages/titan-types && pnpm version "$(TITAN_VERSION)" --allow-same-version

	git checkout -b staging-$(TITAN_VERSION)
	git commit -anm "publish $(TITAN_VERSION) to registry"
	git tag "v$(TITAN_VERSION)"
	git push origin staging-$(TITAN_VERSION) --tags --force

.PHONY: publish-titan
publish-titan: clean build
	echo "Version: $(TITAN_VERSION)"
	echo "Tag: $(TITAN_TAG)"

	# Include the patch in the log.
	git format-patch HEAD~1 --stdout | cat

	npm config set --location=project "//registry.npmjs.org/:_authToken" $(NPM_TOKEN)

	# Publishes the native npm modules.
	goreleaser release --rm-dist -f combined-shim.yml $(SKIP_PUBLISH)

	# Split packing from the publish step so that npm locates the correct .npmrc file.
	cd $(CLI_DIR)/../packages/titan && pnpm pack --pack-destination=$(CLI_DIR)/../
	cd $(CLI_DIR)/../packages/create-titan && pnpm pack --pack-destination=$(CLI_DIR)/../
	cd $(CLI_DIR)/../packages/titan-codemod && pnpm pack --pack-destination=$(CLI_DIR)/../
	cd $(CLI_DIR)/../packages/titan-ignore && pnpm pack --pack-destination=$(CLI_DIR)/../
	cd $(CLI_DIR)/../packages/titan-workspaces && pnpm pack --pack-destination=$(CLI_DIR)/../
	cd $(CLI_DIR)/../packages/titan-gen && pnpm pack --pack-destination=$(CLI_DIR)/../
	cd $(CLI_DIR)/../packages/eslint-plugin-titan && pnpm pack --pack-destination=$(CLI_DIR)/../
	cd $(CLI_DIR)/../packages/eslint-config-titan && pnpm pack --pack-destination=$(CLI_DIR)/../
	cd $(CLI_DIR)/../packages/titan-types && pnpm pack --pack-destination=$(CLI_DIR)/../

ifneq ($(SKIP_PUBLISH),--skip-publish)
	# Publish the remaining JS packages in order to avoid race conditions.
	cd $(CLI_DIR)/../
	npm publish -ddd --tag $(TITAN_TAG) $(CLI_DIR)/../titan-$(TITAN_VERSION).tgz
	npm publish -ddd --tag $(TITAN_TAG) $(CLI_DIR)/../create-titan-$(TITAN_VERSION).tgz
	npm publish -ddd --tag $(TITAN_TAG) $(CLI_DIR)/../titan-codemod-$(TITAN_VERSION).tgz
	npm publish -ddd --tag $(TITAN_TAG) $(CLI_DIR)/../titan-ignore-$(TITAN_VERSION).tgz
	npm publish -ddd --tag $(TITAN_TAG) $(CLI_DIR)/../titan-workspaces-$(TITAN_VERSION).tgz
	npm publish -ddd --tag $(TITAN_TAG) $(CLI_DIR)/../titan-gen-$(TITAN_VERSION).tgz
	npm publish -ddd --tag $(TITAN_TAG) $(CLI_DIR)/../eslint-plugin-titan-$(TITAN_VERSION).tgz
	npm publish -ddd --tag $(TITAN_TAG) $(CLI_DIR)/../eslint-config-titan-$(TITAN_VERSION).tgz
	npm publish -ddd --tag $(TITAN_TAG) $(CLI_DIR)/../titan-types-$(TITAN_VERSION).tgz
endif

demo/lage: install
	node $(CLI_DIR)/scripts/generate.mjs lage

demo/lerna: install
	node $(CLI_DIR)/scripts/generate.mjs lerna

demo/nx: install
	node $(CLI_DIR)/scripts/generate.mjs nx

demo/titan: install
	node $(CLI_DIR)/scripts/generate.mjs titan

demo: demo/lage demo/lerna demo/nx demo/titan

bench/lerna: demo/lerna
	cd $(CLI_DIR)/demo/lerna && node_modules/.bin/lerna run build

bench/lage: demo/lage
	cd $(CLI_DIR)/demo/lage && node_modules/.bin/lage build

bench/nx: demo/nx
	cd $(CLI_DIR)/demo/nx && node_modules/.bin/nx run-many --target=build --all

bench/titan: demo/titan titan
	cd $(CLI_DIR)/demo/titan && $(CLI_DIR)/titan run test

bench: bench/lerna bench/lage bench/nx bench/titan

clean: clean-go clean-build clean-demo clean-rust

clean-rust:
	cargo clean

clean-build:
	rm -f titan

clean-demo:
	rm -rf node_modules
	rm -rf demo

# use target fixture-<some directory under titanrepo-tests/integration/fixtures> to set up the testbed directory
.PHONY=fixture-%
fixture-%:
	$(eval $@_FIXTURE := $(@:fixture-%=%))
	@echo "fixture setup $($@_FIXTURE)"
	rm -rf testbed
	mkdir -p testbed
	../titanrepo-tests/helpers/setup_integration_test.sh ./testbed $($@_FIXTURE)

