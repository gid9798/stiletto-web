import React, { Component } from "react";
import ModalMessage from "./ModalMessage";
import MapLayer from "./MapLayer";
import { withTranslation } from "react-i18next";
import ResourcesInMapList from "./ResourcesInMapList";
import CreateResourceTab from "../components/CreateResourceTab";
import Axios from "axios";
import { getStyle } from "../BGDarkSyles";

class ResourceMap extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user_discord_id: localStorage.getItem("discordid"),
      token: localStorage.getItem("token"),
      coordinateXInput: 0,
      coordinateYInput: 0,
      items: null,
      resourcesInTheMap: null,
      latlng: null,
      pass: this.props.map.pass,
      textSuccess: null,
      center: null,
      mapname: this.props.map.name,
      dateofburning: this.props.map.dateofburning,
      allowEditing: this.props.map.allowedit,
      resourcesFiltered: null,
    };
  }

  componentDidMount() {
    Axios.get(
      "https://raw.githubusercontent.com/dm94/stiletto-web/master/public/json/markers.json"
    ).then((response) => {
      this.setState({ items: response.data });
    });

    Axios.get(process.env.REACT_APP_API_URL + "/maps.php", {
      params: {
        discordid: localStorage.getItem("discordid"),
        token: localStorage.getItem("token"),
        dataupdate: this.props.map.mapid,
        accion: "getresources",
      },
    }).then((response) => {
      if (response.status === 200) {
        this.setState({ resourcesInTheMap: response.data });
      } else if (response.status === 205) {
        localStorage.clear();
        this.setState({
          error: "You don't have access here, try to log in again",
        });
      }
    });
  }

  createResource = (resourceTypeInput, qualityInput, descriptionInput) => {
    Axios.get(process.env.REACT_APP_API_URL + "/maps.php", {
      params: {
        discordid: this.state.user_discord_id,
        token: this.state.token,
        accion: "addresourcemap",
        mapid: this.props.map.mapid,
        resourcetype: resourceTypeInput,
        quality: qualityInput,
        x: this.state.coordinateXInput,
        y: this.state.coordinateYInput,
        description: descriptionInput,
      },
    })
      .then((response) => {
        this.setState({
          coordinateXInput: 0,
          coordinateYInput: 0,
          hasLocation: false,
        });
        if (response.status === 202) {
          this.componentDidMount();
        } else if (response.status === 205) {
          localStorage.clear();
          this.setState({ error: "Login again" });
        }
      })
      .catch((error) => {
        this.setState({ error: "Error when connecting to the API" });
      });
  };

  changePassword = (event) => {
    event.preventDefault();
    Axios.get(process.env.REACT_APP_API_URL + "/maps.php", {
      params: {
        discordid: this.state.user_discord_id,
        token: this.state.token,
        accion: "editpassmap",
        mapid: this.props.map.mapid,
        dataupdate: this.state.pass,
      },
    })
      .then((response) => {
        if (response.status === 202) {
          this.setState({ textSuccess: "Password changed" });
        } else if (response.status === 205) {
          localStorage.clear();
          this.setState({ error: "Login again" });
        }
      })
      .catch((error) => {
        this.setState({ error: "Error when connecting to the API" });
      });
  };

  changeDataMap = (event) => {
    event.preventDefault();
    Axios.get(process.env.REACT_APP_API_URL + "/maps.php", {
      params: {
        discordid: this.state.user_discord_id,
        token: this.state.token,
        accion: "editmap",
        mapid: this.props.map.mapid,
        mapname: this.state.mapname,
        mapdate: this.state.dateofburning,
        allowediting: this.state.allowEditing ? 1 : 0,
      },
    })
      .then((response) => {
        if (response.status === 202) {
          this.setState({ textSuccess: "Map updated" });
        } else if (response.status === 205) {
          localStorage.clear();
          this.setState({ error: "Login again" });
        }
      })
      .catch((error) => {
        this.setState({ error: "Error when connecting to the API" });
      });
  };

  deleteResource = (resourceid, resourcetoken) => {
    Axios.get(process.env.REACT_APP_API_URL + "/maps.php", {
      params: {
        discordid: this.state.user_discord_id,
        token: this.state.token,
        accion: "deleteresource",
        mapid: this.props.map.mapid,
        dataupdate: resourceid,
        resourcetoken: resourcetoken,
      },
    })
      .then((response) => {
        if (response.status === 202) {
          this.componentDidMount();
        } else if (response.status === 205) {
          localStorage.clear();
          this.setState({ error: "Login again" });
        }
      })
      .catch((error) => {
        this.setState({ error: "Error when connecting to the API" });
      });
  };

  editMapTab(t) {
    if (this.state.user_discord_id === this.props.map.discordid) {
      return (
        <div className="card-body">
          <form onSubmit={this.changeDataMap}>
            <div className="form-group">
              <label htmlFor="mapname">{t("Map Name")}</label>
              <input
                type="text"
                className={getStyle("form-control")}
                id="mapname"
                onChange={(evt) => this.setState({ mapname: evt.target.value })}
                value={this.state.mapname}
                maxLength="30"
                required
              ></input>
            </div>
            <div className="form-group">
              <label htmlFor="mapdate">{t("Date of burning")}</label>
              <input
                type="date"
                className={getStyle("form-control")}
                id="mapdate"
                onChange={(evt) =>
                  this.setState({ dateofburning: evt.target.value })
                }
                value={this.state.dateofburning}
                required
              ></input>
            </div>
            <div className="form-group">
              <label htmlFor="mapdate">
                {t("Enable editing with the link")}
              </label>
              <div className="btn-group">
                <button
                  className={
                    this.state.allowEditing
                      ? "btn btn-success active"
                      : "btn btn-success"
                  }
                  onClick={() => {
                    this.setState({ allowEditing: true });
                  }}
                  type="button"
                >
                  {t("Allow Editing")}
                </button>
                <button
                  className={
                    this.state.allowEditing
                      ? "btn btn-danger"
                      : "btn btn-danger active"
                  }
                  onClick={() => {
                    this.setState({ allowEditing: false });
                  }}
                  type="button"
                >
                  {t("Read Only")}
                </button>
              </div>
            </div>
            <button
              className="btn btn-lg btn-outline-success btn-block"
              type="submit"
              value="Submit"
            >
              {t("Update Data")}
            </button>
          </form>
          <form onSubmit={this.changePassword}>
            <div className="form-group">
              <label htmlFor="password">{t("Password")}</label>
              <input
                type="text"
                className={getStyle("form-control")}
                id="password"
                onChange={(evt) => this.setState({ pass: evt.target.value })}
                value={this.state.pass}
                maxLength="20"
                required
              ></input>
            </div>
            <button
              className="btn btn-lg btn-outline-success btn-block"
              type="submit"
              value="Submit"
            >
              {t("Change Password")}
            </button>
          </form>
        </div>
      );
    }
  }

  filterResources = (r) => {
    if (r === "All") {
      this.setState({ resourcesFiltered: null });
    } else {
      let resourcesFiltered = this.state.resourcesInTheMap.filter(
        (resource) => resource.resourcetype === r
      );
      this.setState({ resourcesFiltered: resourcesFiltered });
    }
  };

  render() {
    const { t } = this.props;
    if (this.state.user_discord_id == null || this.state.token == null) {
      return (
        <ModalMessage
          message={{
            isError: true,
            text: t("Login with discord"),
            redirectPage: "/profile",
          }}
        />
      );
    } else if (this.state.error != null) {
      return (
        <ModalMessage
          message={{
            isError: true,
            text: t(this.state.error),
            redirectPage: "/profile",
          }}
        />
      );
    } else if (this.state.textSuccess != null) {
      return (
        <ModalMessage
          message={{
            isError: false,
            text: t(this.state.textSuccess),
            redirectPage: null,
          }}
          onClickOk={() => this.setState({ textSuccess: null })}
        />
      );
    }

    return (
      <div className="row flex-xl-nowrap">
        <div className="col-xl-3 col-sm-12">
          <div className="bd-search d-flex align-items-center">
            <button
              className="btn btn-lg btn-primary btn-block"
              onClick={() => this.props.onReturn()}
            >
              {t("Back to the list of maps")}
            </button>
            <button
              className="btn d-md-none p-0 ml-3"
              type="button"
              data-toggle="collapse"
              data-target="#items-nav"
              aria-controls="items-nav"
              aria-expanded="false"
              aria-label="Toggle items"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                viewBox="0 0 30 30"
                role="img"
                focusable="false"
              >
                <title>{t("Menu")}</title>
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeMiterlimit="10"
                  strokeWidth="2"
                  d="M4 7h22M4 15h22M4 23h22"
                ></path>
              </svg>
            </button>
          </div>
          <nav className="collapse show" id="items-nav" aria-label="Items Navs">
            <ul className="nav nav-tabs" role="tablist">
              <li className="nav-item" role="presentation">
                <a
                  className="nav-link active"
                  id="add-resource-tab"
                  data-toggle="tab"
                  href="#addresource"
                  role="tab"
                  aria-controls="addresource"
                  aria-selected="true"
                >
                  {t("Create resource")}
                </a>
              </li>
              <li className="nav-item" role="presentation">
                <a
                  className="nav-link"
                  id="resource-list-tab"
                  data-toggle="tab"
                  href="#resourcelist"
                  role="tab"
                  aria-controls="resourcelist"
                  aria-selected="false"
                >
                  {t("List")}
                </a>
              </li>
              <li
                className={
                  this.state.user_discord_id === this.props.map.discordid
                    ? "nav-item"
                    : "nav-item d-none"
                }
              >
                <a
                  className="nav-link"
                  id="edit-map-tab"
                  data-toggle="tab"
                  href="#editmap"
                  role="tab"
                  aria-controls="editmap"
                  aria-selected="false"
                >
                  {t("Edit")}
                </a>
              </li>
            </ul>
            <div className="tab-content">
              <div
                className="tab-pane fade show active"
                id="addresource"
                role="tabpanel"
                aria-labelledby="add-resource-tab"
              >
                <CreateResourceTab
                  items={this.state.items}
                  onCreateResource={this.createResource}
                  coordinateXInput={this.state.coordinateXInput}
                  coordinateYInput={this.state.coordinateYInput}
                  onChangeX={(x) =>
                    this.setState({
                      coordinateXInput: x,
                    })
                  }
                  onChangeY={(y) =>
                    this.setState({
                      coordinateYInput: y,
                    })
                  }
                />
              </div>
              <div
                className="tab-pane fade"
                id="resourcelist"
                role="tabpanel"
                aria-labelledby="resource-list-tab"
              >
                <ul
                  className="list-group overflow-auto"
                  style={{ height: "100vh" }}
                >
                  <ResourcesInMapList
                    resources={this.state.resourcesInTheMap}
                    onSelect={(x, y) => this.setState({ center: [x, y] })}
                    onFilter={this.filterResources}
                  />
                </ul>
              </div>
              <div
                className="tab-pane fade"
                id="editmap"
                role="tabpanel"
                aria-labelledby="edit-map-tab"
              >
                {this.editMapTab(t)}
              </div>
            </div>
          </nav>
        </div>
        <div className="col-xl-9 col-sm-12">
          <MapLayer
            key={this.props.map.mapid}
            resourcesInTheMap={
              this.state.resourcesFiltered != null
                ? this.state.resourcesFiltered
                : this.state.resourcesInTheMap
            }
            deleteResource={this.deleteResource}
            changeInput={(x, y) => {
              this.setState({
                coordinateXInput: x,
                coordinateYInput: y,
              });
            }}
            center={this.state.center}
          ></MapLayer>
        </div>
      </div>
    );
  }
}

export default withTranslation()(ResourceMap);
