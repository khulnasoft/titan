//go:build rust
// +build rust

package hashing

import (
	"github.com/khulnasoft/titan/cli/internal/ffi"
	"github.com/khulnasoft/titan/cli/internal/titanpath"
)

func GetPackageFileHashes(rootPath titanpath.AbsoluteSystemPath, packagePath titanpath.AnchoredSystemPath, inputs []string) (map[titanpath.AnchoredUnixPath]string, error) {
	rawHashes, err := ffi.GetPackageFileHashes(rootPath.ToString(), packagePath.ToString(), inputs)
	if err != nil {
		return nil, err
	}

	hashes := make(map[titanpath.AnchoredUnixPath]string, len(rawHashes))
	for rawPath, hash := range rawHashes {
		hashes[titanpath.AnchoredUnixPathFromUpstream(rawPath)] = hash
	}
	return hashes, nil
}

func GetHashesForFiles(rootPath titanpath.AbsoluteSystemPath, files []titanpath.AnchoredSystemPath) (map[titanpath.AnchoredUnixPath]string, error) {
	rawFiles := make([]string, len(files))
	for i, file := range files {
		rawFiles[i] = file.ToString()
	}
	rawHashes, err := ffi.GetHashesForFiles(rootPath.ToString(), rawFiles, false)
	if err != nil {
		return nil, err
	}

	hashes := make(map[titanpath.AnchoredUnixPath]string, len(rawHashes))
	for rawPath, hash := range rawHashes {
		hashes[titanpath.AnchoredUnixPathFromUpstream(rawPath)] = hash
	}
	return hashes, nil
}

func GetHashesForExistingFiles(rootPath titanpath.AbsoluteSystemPath, files []titanpath.AnchoredSystemPath) (map[titanpath.AnchoredUnixPath]string, error) {
	rawFiles := make([]string, len(files))
	for i, file := range files {
		rawFiles[i] = file.ToString()
	}
	rawHashes, err := ffi.GetHashesForFiles(rootPath.ToString(), rawFiles, true)
	if err != nil {
		return nil, err
	}

	hashes := make(map[titanpath.AnchoredUnixPath]string, len(rawHashes))
	for rawPath, hash := range rawHashes {
		hashes[titanpath.AnchoredUnixPathFromUpstream(rawPath)] = hash
	}
	return hashes, nil
}
