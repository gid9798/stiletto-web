import React, { Component } from "react";
import LoadingScreen from "../components/LoadingScreen";
import ModalMessage from "../components/ModalMessage";
import MapLayer from "../components/MapLayer";
import { withTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
const axios = require("axios");
const queryString = require("query-string");

class Map extends Component {
  constructor(props) {
    super(props);

    this.state = {
      resourcesInTheMap: null,
      mapId: null,
      pass: null,
      isLoaded: false,
      textMessage: null,
    };
  }

  componentDidMount() {
    const parsed = queryString.parse(this.props.location.search);
    if (parsed.mapid != null && parsed.pass != null) {
      this.setState({
        mapId: parsed.mapid,
        pass: parsed.pass,
      });

      axios
        .get(process.env.REACT_APP_API_URL + "/maps.php", {
          params: {
            mapid: parsed.mapid,
            pass: parsed.pass,
            accion: "getresourcesnolog",
          },
        })
        .then((response) => {
          if (response.status === 200) {
            this.setState({ resourcesInTheMap: response.data });
          }
        });
    }
  }

  deleteResource = (resourceid) => {
    this.setState({ textMessage: "This function is not available from here" });
  };

  changeCoords = (x, y) => {
    console.log("X: " + x + " | Y: " + y);
  };

  render() {
    const { t } = this.props;
    if (this.state.isLoaded) {
      return <LoadingScreen />;
    }
    if (this.state.textMessage != null) {
      return (
        <ModalMessage
          message={{
            isError: false,
            text: t(this.state.textMessage),
            redirectPage: null,
          }}
          onClickOk={() => this.setState({ textMessage: null })}
        />
      );
    }
    if (this.state.mapId != null && this.state.pass != null) {
      return (
        <div className="row flex-xl-nowrap">
          <Helmet>
            <title>Map - Stiletto</title>
            <meta
              name="description"
              content="Map of resources shared through a link"
            />
          </Helmet>
          <div className="col-xl-12">
            <div className="col-xl-12 text-center">
              <h1>
                {this.state.resourcesInTheMap != null &&
                this.state.resourcesInTheMap[0] != null &&
                this.state.resourcesInTheMap[0].name != null
                  ? this.state.resourcesInTheMap[0].name
                  : ""}
              </h1>
            </div>
            <MapLayer
              key={this.state.mapId}
              resourcesInTheMap={this.state.resourcesInTheMap}
              deleteResource={this.deleteResource}
              changeInput={this.changeCoords}
            ></MapLayer>
          </div>
        </div>
      );
    } else {
      return (
        <ModalMessage
          message={{
            isError: true,
            text: t("You need a link with more data to access here"),
            redirectPage: "/",
          }}
        />
      );
    }
  }
}

export default withTranslation()(Map);
