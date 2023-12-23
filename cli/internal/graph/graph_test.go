package graph

import (
	"testing"

	"gotest.tools/v3/assert"
)

func Test_CommandsInvokingTitan(t *testing.T) {
	type testCase struct {
		command string
		match   bool
	}
	testCases := []testCase{
		{
			"titan run foo",
			true,
		},
		{
			"rm -rf ~/Library/Caches/pnpm && titan run foo && rm -rf ~/.npm",
			true,
		},
		{
			"FLAG=true titan run foo",
			true,
		},
		{
			"npx titan run foo",
			true,
		},
		{
			"echo starting; titan foo; echo done",
			true,
		},
		// We don't catch this as if people are going to try to invoke the titan
		// binary directly, they'll always be able to work around us.
		{
			"./node_modules/.bin/titan foo",
			false,
		},
		{
			"rm -rf ~/Library/Caches/pnpm && rm -rf ~/Library/Caches/titan && rm -rf ~/.npm && rm -rf ~/.pnpm-store && rm -rf ~/.titan",
			false,
		},
	}

	for _, tc := range testCases {
		assert.Equal(t, commandLooksLikeTitan(tc.command), tc.match, tc.command)
	}
}
