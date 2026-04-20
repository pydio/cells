package main

import (
	"fmt"
	"log"

	"github.com/pydio/cells/v5/common/crypto"
)

func main() {
	vc, err := crypto.NewVaultCipher("BzQBOLADorFMETxIJAfRyse/fiBzMqI1u0PhX2aVV4YY/91bldaJ1jDX+g0VOfwPVjw=")
	if err != nil {
		log.Fatal(err)
	}

	b, err := vc.Decrypt("yJsGL/P0sx4VqslIUKkaG80ta/PsDTGB7BSbX93V3h0PS/sMz1E=")
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("%s\n", b)
}
