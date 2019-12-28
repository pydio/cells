package hydra

import (
	"bytes"
	"encoding/json"
	"net/http"
)

var (
	hydraURL = "https://mypydio.localhost:8091/oidc-admin"
)

// TODO : Proto that up ?
type LoginResponse struct {
	Challenge string `json:"challenge"`
	Skip      bool   `json:"skip"`
	Subject   string `json:"subject"`
}

type ConsentResponse struct {
	Challenge                    string   `json:"challenge"`
	Skip                         bool     `json:"skip"`
	Subject                      string   `json:"subject"`
	RequestedScope               []string `json:"requested_scope"`
	RequestedAccessTokenAudience []string `json:"requested_access_token_audience"`
}

type LogoutResponse struct {
	RequestURL  string `json:"request_url"`
	RPInitiated bool   `json:"rp_initiated"`
	SID         string `json:"sid"`
	Subject     string `json:"subject"`
}

type RedirectResponse struct {
	RedirectTo string `json:"redirect_to"`
}

func GetLogin(challenge string) (*LoginResponse, error) {
	resp := new(LoginResponse)

	if err := get("login", challenge, resp); err != nil {
		return nil, err
	}

	return resp, nil
}

func AcceptLogin(challenge string, body interface{}) (*RedirectResponse, error) {
	resp := new(RedirectResponse)

	if err := put("login", "accept", challenge, body, resp); err != nil {
		return nil, err
	}

	return resp, nil
}

func RejectLogin(challenge string, body interface{}) (*RedirectResponse, error) {
	resp := new(RedirectResponse)

	if err := put("login", "reject", challenge, body, resp); err != nil {
		return nil, err
	}

	return resp, nil
}

func GetConsent(challenge string) (*ConsentResponse, error) {
	resp := new(ConsentResponse)

	if err := get("consent", challenge, resp); err != nil {
		return nil, err
	}

	return resp, nil
}

func AcceptConsent(challenge string, body interface{}) (*RedirectResponse, error) {
	resp := new(RedirectResponse)

	if err := put("consent", "accept", challenge, body, resp); err != nil {
		return nil, err
	}

	return resp, nil
}

func RejectConsent(challenge string, body interface{}) (*RedirectResponse, error) {
	resp := new(RedirectResponse)

	if err := put("consent", "reject", challenge, body, resp); err != nil {
		return nil, err
	}

	return resp, nil
}

func GetLogout(challenge string) (*LogoutResponse, error) {
	resp := new(LogoutResponse)

	if err := get("logout", challenge, resp); err != nil {
		return nil, err
	}

	return resp, nil
}

func AcceptLogout(challenge string, body interface{}) (*RedirectResponse, error) {
	resp := new(RedirectResponse)

	if err := put("logout", "accept", challenge, body, resp); err != nil {
		return nil, err
	}

	return resp, nil
}

func RejectLogout(challenge string, body interface{}) (*RedirectResponse, error) {
	resp := new(RedirectResponse)

	if err := put("logout", "reject", challenge, body, resp); err != nil {
		return nil, err
	}

	return resp, nil
}

func get(flow string, challenge string, res interface{}) error {
	cli := &http.Client{}

	req, err := http.NewRequest("GET", hydraURL+"/oauth2/auth/requests/"+flow, nil)

	q := req.URL.Query()
	q.Add(flow+"_challenge", challenge)
	req.URL.RawQuery = q.Encode()

	resp, err := cli.Do(req)
	if err != nil {
		return err
	}

	if err := json.NewDecoder(resp.Body).Decode(res); err != nil {
		return err
	}

	return nil
}

func put(flow string, action string, challenge string, body interface{}, res interface{}) error {
	cli := &http.Client{}

	data, err := json.Marshal(body)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("PUT", hydraURL+"/oauth2/auth/requests/"+flow+"/"+action, bytes.NewBuffer(data))
	req.Header.Set("Content-Type", "application/json")

	q := req.URL.Query()
	q.Add(flow+"_challenge", challenge)
	req.URL.RawQuery = q.Encode()

	resp, err := cli.Do(req)
	if err != nil {
		return err
	}

	if err := json.NewDecoder(resp.Body).Decode(res); err != nil {
		return err
	}

	return nil
}
