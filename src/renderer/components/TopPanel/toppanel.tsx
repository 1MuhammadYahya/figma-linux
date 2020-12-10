import * as React from "react";

import { Icon, Button } from "Elements";
import Tabs from "Components/Tabs";

interface TopPanelProps {
  current: number;
  scalePanel: number;

  onMainTab(e: React.MouseEvent<HTMLDivElement>): void;
  openSettings(e: React.MouseEvent<HTMLDivElement>): void;
  onHomeClick(e: React.MouseEvent<HTMLDivElement>): void;
  getTab(id: number): Tab | undefined;
  newTab(): void;
  closew(e: React.MouseEvent<HTMLDivElement>): void;
  maxiw(e: React.MouseEvent<HTMLDivElement>): void;
  miniw(e: React.MouseEvent<HTMLDivElement>): void;
}

const TopPanel: React.FunctionComponent<TopPanelProps> = props => {
  const currentTab: Tab | undefined = props.getTab(props.current);

  return (
    <div className="top-panel" style={{ zoom: props.scalePanel ? props.scalePanel : 1 }}>
      <div className="panelButtons">
        <Button className={`button_clear${props.current === 1 ? " tab_active" : ""}`} onClick={props.onMainTab}>
          <Icon color="#7A7A7A" type="Main" size="18" />
        </Button>
        {!currentTab || (!!currentTab && currentTab.showBackBtn) ? (
          <Button className="button_clear" onClick={props.onHomeClick}>
            <Icon color="#7A7A7A" type="ArrowLeft" size="18" />
          </Button>
        ) : null}
        <Button className="button_clear" onClick={props.newTab}>
          <Icon color="#7A7A7A" type="Plus" size="18" />
        </Button>
      </div>
      <Tabs />
      <div className="panelButtons">
        <Button className="button_clear" onClick={props.openSettings}>
          <Icon color="#7A7A7A" type="Settings" size="18" />
        </Button>
        <Button className="button_clear" onClick={props.miniw}>
          <Icon color="#7A7A7A" type="Minimize" size="18" />
        </Button>
        <Button className="button_clear" onClick={props.maxiw}>
          <Icon color="#7A7A7A" type="Maximize" size="18" />
        </Button>
        <Button className="button_clear" onClick={props.closew}>
          <Icon color="#7A7A7A" type="Close" size="18" />
        </Button>
      </div>
    </div>
  );
};

export default TopPanel;
